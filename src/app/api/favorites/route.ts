import { authOptions } from "@/lib/auth";
import {
	createFavorite,
	getFavoritesByUserId,
	upsertPlace,
} from "@/lib/db/place";
import {
	AddFavoriteRequest,
	FilterOptions,
	PlaceCategory,
} from "@/types/place";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const VALID_CATEGORIES: PlaceCategory[] = [
	"公園",
	"温泉",
	"銭湯",
	"食事",
	"カフェ",
	"観光",
];

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
		priceLevel: typeof raw.priceLevel === "string" ? raw.priceLevel : null,
		openingHours:
			typeof raw.openingHours === "string" ? raw.openingHours : null,
		categoryNames: Array.isArray(raw.categoryNames)
			? (raw.categoryNames as string[])
			: [],
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

export async function GET(request: NextRequest): Promise<NextResponse> {
	const session = await getServerSession(authOptions);

	if (session === null) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	if (typeof userId !== "number") {
		return NextResponse.json({ error: "Invalid user" }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const filter: FilterOptions = {};

	const visited = searchParams.get("visited");
	if (visited !== null) {
		filter.visited = visited === "true";
	}

	const category = searchParams.get("category");
	if (
		category !== null &&
		VALID_CATEGORIES.includes(category as PlaceCategory)
	) {
		filter.category = category as PlaceCategory;
	}

	const priceLevel = searchParams.get("priceLevel");
	if (priceLevel !== null) {
		filter.priceLevel = priceLevel;
	}

	try {
		const favorites = await getFavoritesByUserId(
			userId,
			Object.keys(filter).length > 0 ? filter : undefined,
		);
		return NextResponse.json(favorites);
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
