import { authOptions } from "@/lib/auth";
import { createActivity, getActivitiesByUserId } from "@/lib/db/activity";
import { CreateActivityRequest } from "@/types/activity";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
	const session = await getServerSession(authOptions);

	if (session === null) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	if (typeof userId !== "number") {
		return NextResponse.json({ error: "Invalid user" }, { status: 401 });
	}

	try {
		const activities = await getActivitiesByUserId(userId);
		return NextResponse.json(activities);
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: Request): Promise<NextResponse> {
	const session = await getServerSession(authOptions);

	if (session === null) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	if (typeof userId !== "number") {
		return NextResponse.json({ error: "Invalid user" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (typeof body !== "object" || body === null) {
		return NextResponse.json(
			{ error: "Invalid request body" },
			{ status: 400 },
		);
	}

	const raw = body as Record<string, unknown>;

	if (typeof raw.distance !== "number") {
		return NextResponse.json(
			{ error: "distance is required and must be a number" },
			{ status: 400 },
		);
	}

	if (typeof raw.averageVelocity !== "number") {
		return NextResponse.json(
			{ error: "averageVelocity is required and must be a number" },
			{ status: 400 },
		);
	}

	if (typeof raw.maxVelocity !== "number") {
		return NextResponse.json(
			{ error: "maxVelocity is required and must be a number" },
			{ status: 400 },
		);
	}

	if (typeof raw.elevation !== "number") {
		return NextResponse.json(
			{ error: "elevation is required and must be a number" },
			{ status: 400 },
		);
	}

	if (typeof raw.burnCalories !== "number") {
		return NextResponse.json(
			{ error: "burnCalories is required and must be a number" },
			{ status: 400 },
		);
	}

	if (typeof raw.drivingTime !== "number") {
		return NextResponse.json(
			{ error: "drivingTime is required and must be a number" },
			{ status: 400 },
		);
	}

	const input: CreateActivityRequest = {
		distance: raw.distance,
		averageVelocity: raw.averageVelocity,
		maxVelocity: raw.maxVelocity,
		elevation: raw.elevation,
		burnCalories: raw.burnCalories,
		drivingTime: raw.drivingTime,
		activityAt: typeof raw.activityAt === "string" ? raw.activityAt : null,
		polyline: typeof raw.polyline === "string" ? raw.polyline : null,
	};

	try {
		const activity = await createActivity(userId, input);
		return NextResponse.json(activity, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
