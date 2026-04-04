import { getPlaceById } from "@/lib/db/place";
import { NextResponse } from "next/server";

interface RouteParams {
	params: Promise<{ id: string }>;
}

export async function GET(
	_request: Request,
	{ params }: RouteParams,
): Promise<NextResponse> {
	const { id: idStr } = await params;
	const id = parseInt(idStr, 10);
	if (isNaN(id)) {
		return NextResponse.json({ error: "Invalid id" }, { status: 400 });
	}

	try {
		const place = await getPlaceById(id);
		if (place === null) {
			return NextResponse.json({ error: "Not found" }, { status: 404 });
		}
		return NextResponse.json(place);
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
