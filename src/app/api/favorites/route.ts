import { authOptions } from "@/lib/auth";
import {
	createFavorite,
	getFavoritesByUserId,
	upsertPlace,
} from "@/lib/db/place";
import { AddFavoriteRequest } from "@/types/place";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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

	if (typeof raw.googlePlaceId !== "string" || raw.googlePlaceId === "") {
		return NextResponse.json(
			{ error: "googlePlaceId is required" },
			{ status: 400 },
		);
	}

	if (typeof raw.name !== "string" || raw.name === "") {
		return NextResponse.json(
			{ error: "name is required" },
			{ status: 400 },
		);
	}

	const addRequest: AddFavoriteRequest = {
		googlePlaceId: raw.googlePlaceId,
		name: raw.name,
		latitude: typeof raw.latitude === "number" ? raw.latitude : null,
		longitude: typeof raw.longitude === "number" ? raw.longitude : null,
		address: typeof raw.address === "string" ? raw.address : null,
		imageUrl: typeof raw.imageUrl === "string" ? raw.imageUrl : null,
	};

	try {
		const place = await upsertPlace(addRequest);
		const favorite = await createFavorite(userId, place.id);
		return NextResponse.json(favorite, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

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
		const favorites = await getFavoritesByUserId(userId);
		return NextResponse.json(favorites);
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
