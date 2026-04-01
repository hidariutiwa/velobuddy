import { authOptions } from "@/lib/auth";
import {
	deleteFavorite,
	getFavoriteById,
	updateFavorite,
} from "@/lib/db/place";
import { UpdateFavoriteRequest } from "@/types/place";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

interface RouteParams {
	params: { id: string };
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

	const id = parseInt(params.id, 10);
	if (isNaN(id)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	let existing: Awaited<ReturnType<typeof getFavoriteById>>;
	try {
		existing = await getFavoriteById(id);
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
	const input: UpdateFavoriteRequest = {};

	if ("visited" in raw) {
		if (typeof raw.visited !== "boolean") {
			return NextResponse.json(
				{ error: "visited must be a boolean" },
				{ status: 400 },
			);
		}
		input.visited = raw.visited;
	}

	if ("memo" in raw) {
		if (raw.memo !== null && typeof raw.memo !== "string") {
			return NextResponse.json(
				{ error: "memo must be a string or null" },
				{ status: 400 },
			);
		}
		input.memo = raw.memo as string | null;
	}

	try {
		const updated = await updateFavorite(id, input);
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

	const id = parseInt(params.id, 10);
	if (isNaN(id)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	let existing: Awaited<ReturnType<typeof getFavoriteById>>;
	try {
		existing = await getFavoriteById(id);
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
		await deleteFavorite(id, userId);
		return new NextResponse(null, { status: 204 });
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
