import { authOptions } from "@/lib/auth";
import { createActivity } from "@/lib/db/activity";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { fetchStravaActivities, mapStravaToCreateInput } from "@/lib/strava";
import { PrismaPg } from "@prisma/adapter-pg";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

export async function POST(): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	if (typeof userId !== "number") {
		return NextResponse.json({ error: "Invalid user" }, { status: 401 });
	}

	try {
		// Fetch activities from Strava (cycling only)
		const stravaActivities = await fetchStravaActivities(userId, 50);
		const rides = stravaActivities.filter(
			(a) =>
				a.sport_type === "Ride" ||
				a.sport_type === "EBikeRide" ||
				a.sport_type === "VirtualRide",
		);

		// Get existing Strava IDs to avoid duplicates
		const existingActivities = await prisma.activity.findMany({
			where: {
				userId,
				stravaId: { not: null },
			},
			select: { stravaId: true },
		});
		const existingStravaIds = new Set(
			existingActivities
				.map((a) => a.stravaId?.toString())
				.filter(Boolean),
		);

		// Import new activities
		let imported = 0;
		let skipped = 0;

		for (const activity of rides) {
			if (existingStravaIds.has(activity.id.toString())) {
				skipped++;
				continue;
			}

			const input = mapStravaToCreateInput(activity);
			await createActivity(userId, input);
			imported++;
		}

		return NextResponse.json({
			imported,
			skipped,
			total: rides.length,
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Sync failed";

		if (message === "Strava not connected") {
			return NextResponse.json(
				{ error: "Stravaが連携されていません" },
				{ status: 400 },
			);
		}

		return NextResponse.json(
			{ error: "同期に失敗しました" },
			{ status: 500 },
		);
	}
}
