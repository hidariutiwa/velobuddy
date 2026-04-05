import { authOptions } from "@/lib/auth";
import { saveStravaTokens } from "@/lib/db/strava";
import { exchangeCodeForTokens } from "@/lib/strava";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) {
		return NextResponse.redirect(
			new URL("/activities", request.nextUrl.origin),
		);
	}

	const code = request.nextUrl.searchParams.get("code");
	if (!code) {
		return NextResponse.redirect(
			new URL("/activities?strava_error=no_code", request.nextUrl.origin),
		);
	}

	try {
		const tokens = await exchangeCodeForTokens(code);
		await saveStravaTokens(session.user.id, tokens);

		return NextResponse.redirect(
			new URL(
				"/activities?strava_connected=true",
				request.nextUrl.origin,
			),
		);
	} catch {
		return NextResponse.redirect(
			new URL(
				"/activities?strava_error=auth_failed",
				request.nextUrl.origin,
			),
		);
	}
}
