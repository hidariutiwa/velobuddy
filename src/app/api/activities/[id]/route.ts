import { authOptions } from "@/lib/auth";
import {
	deleteActivity,
	getActivityById,
	getActivityOwner,
	updateActivity,
} from "@/lib/db/activity";
import { UpdateActivityRequest } from "@/types/activity";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(
	_request: Request,
	{ params }: RouteParams,
): Promise<NextResponse> {
	const session = await getServerSession(authOptions);

	if (session === null) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	if (typeof userId !== "number") {
		return NextResponse.json({ error: "Invalid user" }, { status: 401 });
	}

	const { id: idStr } = await params;
	const id = parseInt(idStr, 10);
	if (isNaN(id)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	try {
		const activity = await getActivityById(id);
		if (activity === null) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}
		return NextResponse.json(activity);
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function PATCH(
	request: Request,
	{ params }: RouteParams,
): Promise<NextResponse> {
	const session = await getServerSession(authOptions);

	if (session === null) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	if (typeof userId !== "number") {
		return NextResponse.json({ error: "Invalid user" }, { status: 401 });
	}

	const { id: idStr } = await params;
	const id = parseInt(idStr, 10);
	if (isNaN(id)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	let existing: Awaited<ReturnType<typeof getActivityOwner>>;
	try {
		existing = await getActivityOwner(id);
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}

	if (existing === null) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	if (existing.userId !== userId) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
	const input: UpdateActivityRequest = {};

	if ("activityAt" in raw) {
		if (raw.activityAt !== null && typeof raw.activityAt !== "string") {
			return NextResponse.json(
				{ error: "activityAt must be a string or null" },
				{ status: 400 },
			);
		}
		input.activityAt = raw.activityAt as string | null;
	}

	if ("distance" in raw) {
		if (typeof raw.distance !== "number") {
			return NextResponse.json(
				{ error: "distance must be a number" },
				{ status: 400 },
			);
		}
		input.distance = raw.distance;
	}

	if ("averageVelocity" in raw) {
		if (typeof raw.averageVelocity !== "number") {
			return NextResponse.json(
				{ error: "averageVelocity must be a number" },
				{ status: 400 },
			);
		}
		input.averageVelocity = raw.averageVelocity;
	}

	if ("maxVelocity" in raw) {
		if (typeof raw.maxVelocity !== "number") {
			return NextResponse.json(
				{ error: "maxVelocity must be a number" },
				{ status: 400 },
			);
		}
		input.maxVelocity = raw.maxVelocity;
	}

	if ("elevation" in raw) {
		if (typeof raw.elevation !== "number") {
			return NextResponse.json(
				{ error: "elevation must be a number" },
				{ status: 400 },
			);
		}
		input.elevation = raw.elevation;
	}

	if ("burnCalories" in raw) {
		if (typeof raw.burnCalories !== "number") {
			return NextResponse.json(
				{ error: "burnCalories must be a number" },
				{ status: 400 },
			);
		}
		input.burnCalories = raw.burnCalories;
	}

	if ("drivingTime" in raw) {
		if (typeof raw.drivingTime !== "number") {
			return NextResponse.json(
				{ error: "drivingTime must be a number" },
				{ status: 400 },
			);
		}
		input.drivingTime = raw.drivingTime;
	}

	if ("polyline" in raw) {
		if (raw.polyline !== null && typeof raw.polyline !== "string") {
			return NextResponse.json(
				{ error: "polyline must be a string or null" },
				{ status: 400 },
			);
		}
		input.polyline = raw.polyline as string | null;
	}

	try {
		const updated = await updateActivity(id, input);
		return NextResponse.json(updated);
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_request: Request,
	{ params }: RouteParams,
): Promise<NextResponse> {
	const session = await getServerSession(authOptions);

	if (session === null) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	if (typeof userId !== "number") {
		return NextResponse.json({ error: "Invalid user" }, { status: 401 });
	}

	const { id: idStr } = await params;
	const id = parseInt(idStr, 10);
	if (isNaN(id)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	let existing: Awaited<ReturnType<typeof getActivityOwner>>;
	try {
		existing = await getActivityOwner(id);
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}

	if (existing === null) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	if (existing.userId !== userId) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	try {
		await deleteActivity(id, userId);
		return new NextResponse(null, { status: 204 });
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
