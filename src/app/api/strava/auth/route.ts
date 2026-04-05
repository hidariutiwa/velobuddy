import { authOptions } from "@/lib/auth";
import { getStravaAuthUrl } from "@/lib/strava";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const url = getStravaAuthUrl();
	return NextResponse.redirect(url);
}
