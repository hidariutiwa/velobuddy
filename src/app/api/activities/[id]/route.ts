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

	if ("name" in raw) {
		if (typeof raw.name !== "string") {
			return NextResponse.json(
				{ error: "name must be a string" },
				{ status: 400 },
			);
		}
		input.name = raw.name;
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

	if ("movingTime" in raw) {
		if (typeof raw.movingTime !== "number") {
			return NextResponse.json(
				{ error: "movingTime must be a number" },
				{ status: 400 },
			);
		}
		input.movingTime = raw.movingTime;
	}

	if ("elapsedTime" in raw) {
		if (typeof raw.elapsedTime !== "number") {
			return NextResponse.json(
				{ error: "elapsedTime must be a number" },
				{ status: 400 },
			);
		}
		input.elapsedTime = raw.elapsedTime;
	}

	if ("averageSpeed" in raw) {
		if (typeof raw.averageSpeed !== "number") {
			return NextResponse.json(
				{ error: "averageSpeed must be a number" },
				{ status: 400 },
			);
		}
		input.averageSpeed = raw.averageSpeed;
	}

	if ("maxSpeed" in raw) {
		if (typeof raw.maxSpeed !== "number") {
			return NextResponse.json(
				{ error: "maxSpeed must be a number" },
				{ status: 400 },
			);
		}
		input.maxSpeed = raw.maxSpeed;
	}

	if ("totalElevationGain" in raw) {
		if (typeof raw.totalElevationGain !== "number") {
			return NextResponse.json(
				{ error: "totalElevationGain must be a number" },
				{ status: 400 },
			);
		}
		input.totalElevationGain = raw.totalElevationGain;
	}

	if ("calories" in raw) {
		if (raw.calories !== null && typeof raw.calories !== "number") {
			return NextResponse.json(
				{ error: "calories must be a number or null" },
				{ status: 400 },
			);
		}
		input.calories = raw.calories as number | null;
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
