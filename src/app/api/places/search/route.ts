import { upsertPlace } from "@/lib/db/place";
import { GooglePlacesTextSearchApiResponse } from "@/types/googlePlaces";
import { AddFavoriteRequest, PlaceCache } from "@/types/place";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
	const { searchParams } = new URL(request.url);
	const q = searchParams.get("q");

	if (q === null || q === "") {
		return NextResponse.json({ error: "q is required" }, { status: 400 });
	}

	try {
		const response = await fetch(
			"https://places.googleapis.com/v1/places:searchText",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Goog-Api-Key":
						process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY ?? "",
					"X-Goog-FieldMask":
						"places.id,places.displayName,places.formattedAddress,places.location,places.photos",
				},
				body: JSON.stringify({ textQuery: q, languageCode: "ja" }),
			},
		);

		if (!response.ok) {
			return NextResponse.json(
				{ error: "Internal server error" },
				{ status: 500 },
			);
		}

		const data =
			(await response.json()) as GooglePlacesTextSearchApiResponse;

		const addRequests: AddFavoriteRequest[] = (data.places ?? []).map(
			(result) => ({
				googlePlaceId: result.id,
				name: result.displayName.text,
				latitude: result.location?.latitude ?? null,
				longitude: result.location?.longitude ?? null,
				address: result.formattedAddress ?? null,
				imageUrl: result.photos?.[0]?.name ?? null,
			}),
		);

		const places: PlaceCache[] = await Promise.all(
			addRequests.map((req) => upsertPlace(req)),
		);

		return NextResponse.json({ places });
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
