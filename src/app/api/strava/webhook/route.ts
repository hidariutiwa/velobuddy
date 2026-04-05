import { createActivity } from "@/lib/db/activity";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { fetchStravaActivityById, mapStravaToCreateInput } from "@/lib/strava";
import { PrismaPg } from "@prisma/adapter-pg";
import { NextRequest, NextResponse } from "next/server";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN ?? "velobuddy";

/**
 * GET — Strava subscription validation (hub.challenge)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
	const params = request.nextUrl.searchParams;
	const mode = params.get("hub.mode");
	const token = params.get("hub.verify_token");
	const challenge = params.get("hub.challenge");

	if (mode === "subscribe" && token === VERIFY_TOKEN && challenge) {
		return NextResponse.json({ "hub.challenge": challenge });
	}

	return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

interface WebhookEvent {
	object_type: string;
	aspect_type: string;
	object_id: number;
	owner_id: number;
	subscription_id: number;
	event_time: number;
	updates: Record<string, unknown>;
}

/**
 * POST — Strava webhook event receiver
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
	let event: WebhookEvent;
	try {
		event = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	// Only process activity events
	if (event.object_type !== "activity") {
		return NextResponse.json({ ok: true });
	}

	// Find the user by Strava athlete ID
	const user = await prisma.user.findUnique({
		where: { stravaAthleteId: event.owner_id },
		select: { id: true },
	});

	if (!user) {
		// Unknown athlete — ignore
		return NextResponse.json({ ok: true });
	}

	const userId = user.id;
	const stravaActivityId = event.object_id;

	switch (event.aspect_type) {
		case "create": {
			// Check if already imported
			const existing = await prisma.activity.findUnique({
				where: { stravaId: BigInt(stravaActivityId) },
				select: { id: true },
			});
			if (existing) {
				return NextResponse.json({
					ok: true,
					status: "already_exists",
				});
			}

			try {
				const stravaActivity = await fetchStravaActivityById(
					userId,
					stravaActivityId,
				);

				// Only import cycling activities
				if (
					stravaActivity.sport_type !== "Ride" &&
					stravaActivity.sport_type !== "EBikeRide" &&
					stravaActivity.sport_type !== "VirtualRide"
				) {
					return NextResponse.json({
						ok: true,
						status: "skipped_non_ride",
					});
				}

				const input = mapStravaToCreateInput(stravaActivity);
				await createActivity(userId, input);
				return NextResponse.json({ ok: true, status: "imported" });
			} catch {
				return NextResponse.json({ ok: true, status: "fetch_failed" });
			}
		}

		case "update": {
			// Update title if changed
			if (event.updates.title) {
				await prisma.activity.updateMany({
					where: { stravaId: BigInt(stravaActivityId), userId },
					data: { name: event.updates.title as string },
				});
			}
			return NextResponse.json({ ok: true, status: "updated" });
		}

		case "delete": {
			await prisma.activity.deleteMany({
				where: { stravaId: BigInt(stravaActivityId), userId },
			});
			return NextResponse.json({ ok: true, status: "deleted" });
		}

		default:
			return NextResponse.json({ ok: true });
	}
}
