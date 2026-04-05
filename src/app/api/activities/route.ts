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

	if (typeof raw.movingTime !== "number") {
		return NextResponse.json(
			{ error: "movingTime is required and must be a number" },
			{ status: 400 },
		);
	}

	if (typeof raw.elapsedTime !== "number") {
		return NextResponse.json(
			{ error: "elapsedTime is required and must be a number" },
			{ status: 400 },
		);
	}

	if (typeof raw.averageSpeed !== "number") {
		return NextResponse.json(
			{ error: "averageSpeed is required and must be a number" },
			{ status: 400 },
		);
	}

	if (typeof raw.maxSpeed !== "number") {
		return NextResponse.json(
			{ error: "maxSpeed is required and must be a number" },
			{ status: 400 },
		);
	}

	const input: CreateActivityRequest = {
		distance: raw.distance,
		movingTime: raw.movingTime,
		elapsedTime: raw.elapsedTime,
		averageSpeed: raw.averageSpeed,
		maxSpeed: raw.maxSpeed,
		name: typeof raw.name === "string" ? raw.name : undefined,
		sportType:
			typeof raw.sportType === "string" ? raw.sportType : undefined,
		startDate: typeof raw.startDate === "string" ? raw.startDate : null,
		totalElevationGain:
			typeof raw.totalElevationGain === "number"
				? raw.totalElevationGain
				: undefined,
		elevHigh: typeof raw.elevHigh === "number" ? raw.elevHigh : undefined,
		elevLow: typeof raw.elevLow === "number" ? raw.elevLow : undefined,
		averageWatts:
			typeof raw.averageWatts === "number" ? raw.averageWatts : undefined,
		calories: typeof raw.calories === "number" ? raw.calories : undefined,
		polyline: typeof raw.polyline === "string" ? raw.polyline : null,
		summaryPolyline:
			typeof raw.summaryPolyline === "string"
				? raw.summaryPolyline
				: null,
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
