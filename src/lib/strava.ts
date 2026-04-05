import { getStravaTokens, saveStravaTokens } from "@/lib/db/strava";

const STRAVA_BASE_URL = "https://www.strava.com/api/v3";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";

function getClientCredentials() {
	const clientId = process.env.STRAVA_AUTH_CLIENT_ID;
	const clientSecret = process.env.STRAVA_AUTH_CLIENT_SECRET;
	if (!clientId || !clientSecret) {
		throw new Error(
			"STRAVA_AUTH_CLIENT_ID and STRAVA_AUTH_CLIENT_SECRET must be set",
		);
	}
	return { clientId, clientSecret };
}

async function refreshAccessToken(
	userId: number,
	refreshToken: string,
): Promise<string> {
	const { clientId, clientSecret } = getClientCredentials();

	const res = await fetch(STRAVA_TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			grant_type: "refresh_token",
			refresh_token: refreshToken,
		}),
	});

	if (!res.ok) {
		throw new Error(`Strava token refresh failed: ${res.status}`);
	}

	const data = await res.json();
	await saveStravaTokens(userId, {
		athleteId: data.athlete?.id ?? 0,
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		expiresAt: data.expires_at,
	});

	return data.access_token as string;
}

async function getValidAccessToken(userId: number): Promise<string> {
	const tokens = await getStravaTokens(userId);
	if (!tokens) {
		throw new Error("Strava not connected");
	}

	const now = Math.floor(Date.now() / 1000);
	if (tokens.expiresAt > now + 60) {
		return tokens.accessToken;
	}

	return refreshAccessToken(userId, tokens.refreshToken);
}

export async function exchangeCodeForTokens(code: string) {
	const { clientId, clientSecret } = getClientCredentials();

	const res = await fetch(STRAVA_TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			client_id: clientId,
			client_secret: clientSecret,
			code,
			grant_type: "authorization_code",
		}),
	});

	if (!res.ok) {
		const error = await res.text();
		throw new Error(`Strava OAuth failed (${res.status}): ${error}`);
	}

	const data = await res.json();
	return {
		accessToken: data.access_token as string,
		refreshToken: data.refresh_token as string,
		expiresAt: data.expires_at as number,
		athleteId: data.athlete.id as number,
	};
}

export function getStravaAuthUrl(): string {
	const { clientId } = getClientCredentials();
	const redirectUri = `${process.env.NEXTAUTH_URL}/api/strava/callback`;
	const scope = "activity:read_all";
	return (
		`https://www.strava.com/oauth/authorize` +
		`?client_id=${clientId}` +
		`&redirect_uri=${encodeURIComponent(redirectUri)}` +
		`&response_type=code` +
		`&scope=${scope}` +
		`&approval_prompt=auto`
	);
}

interface StravaActivity {
	id: number;
	name: string;
	type: string;
	sport_type: string;
	start_date: string;
	timezone: string;
	distance: number;
	moving_time: number;
	elapsed_time: number;
	total_elevation_gain: number;
	elev_high?: number;
	elev_low?: number;
	average_speed: number;
	max_speed: number;
	average_watts?: number;
	device_watts?: boolean;
	kilojoules?: number;
	average_cadence?: number;
	average_heartrate?: number;
	max_heartrate?: number;
	has_heartrate?: boolean;
	calories?: number;
	average_temp?: number;
	map?: {
		summary_polyline?: string;
	};
	start_latlng?: [number, number];
	end_latlng?: [number, number];
	trainer: boolean;
	commute: boolean;
	manual: boolean;
	gear_id?: string;
	external_id?: string;
}

export async function fetchStravaActivities(
	userId: number,
	perPage: number = 30,
	page: number = 1,
): Promise<StravaActivity[]> {
	const accessToken = await getValidAccessToken(userId);

	const res = await fetch(
		`${STRAVA_BASE_URL}/athlete/activities?per_page=${perPage}&page=${page}`,
		{ headers: { Authorization: `Bearer ${accessToken}` } },
	);

	if (!res.ok) {
		throw new Error(`Strava API error: ${res.status}`);
	}

	return res.json();
}

export async function fetchStravaActivityById(
	userId: number,
	activityId: number,
): Promise<StravaActivity> {
	const accessToken = await getValidAccessToken(userId);

	const res = await fetch(`${STRAVA_BASE_URL}/activities/${activityId}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!res.ok) {
		throw new Error(`Strava API error: ${res.status}`);
	}

	return res.json();
}

export function mapStravaToCreateInput(activity: StravaActivity) {
	return {
		stravaId: activity.id.toString(),
		externalId: activity.external_id ?? null,
		source: "strava" as const,
		name: activity.name,
		sportType: activity.sport_type,
		startDate: activity.start_date,
		timezone: activity.timezone,
		movingTime: activity.moving_time,
		elapsedTime: activity.elapsed_time,
		distance: activity.distance,
		totalElevationGain: activity.total_elevation_gain,
		elevHigh: activity.elev_high ?? null,
		elevLow: activity.elev_low ?? null,
		averageSpeed: activity.average_speed,
		maxSpeed: activity.max_speed,
		averageWatts: activity.average_watts ?? null,
		deviceWatts: activity.device_watts ?? false,
		kilojoules: activity.kilojoules ?? null,
		averageCadence: activity.average_cadence ?? null,
		averageHeartrate: activity.average_heartrate ?? null,
		maxHeartrate: activity.max_heartrate ?? null,
		hasHeartrate: activity.has_heartrate ?? false,
		calories: activity.calories ?? null,
		averageTemp: activity.average_temp ?? null,
		summaryPolyline: activity.map?.summary_polyline ?? null,
		startLatlng: activity.start_latlng ?? null,
		endLatlng: activity.end_latlng ?? null,
		trainer: activity.trainer,
		commute: activity.commute,
		manual: activity.manual,
		gearId: activity.gear_id ?? null,
	};
}
