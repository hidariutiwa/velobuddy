export interface ActivitySplitResponse {
	split: number;
	distance: number;
	elapsedTime: number;
	movingTime: number;
	elevationDifference: number;
	averageSpeed: number;
	paceZone: number;
}

export interface ActivityResponse {
	id: number;
	stravaId: string | null; // BigInt serialized as string
	source: string;

	name: string;
	sportType: string;

	startDate: string | null;
	timezone: string | null;
	movingTime: number;
	elapsedTime: number;

	distance: number;
	totalElevationGain: number;
	elevHigh: number | null;
	elevLow: number | null;

	averageSpeed: number;
	maxSpeed: number;

	averageWatts: number | null;
	deviceWatts: boolean;
	kilojoules: number | null;

	averageCadence: number | null;
	averageHeartrate: number | null;
	maxHeartrate: number | null;
	hasHeartrate: boolean;
	calories: number | null;
	averageTemp: number | null;

	polyline: string | null;
	summaryPolyline: string | null;
	startLatlng: [number, number] | null;
	endLatlng: [number, number] | null;

	trainer: boolean;
	commute: boolean;
	manual: boolean;

	gearId: string | null;
	createdAt: string;
	updatedAt: string;

	splits?: ActivitySplitResponse[];
}

export interface CreateActivityRequest {
	stravaId?: string | null;
	externalId?: string | null;
	source?: string;

	name?: string;
	sportType?: string;

	startDate?: string | null;
	timezone?: string | null;
	movingTime: number;
	elapsedTime: number;

	distance: number;
	totalElevationGain?: number;
	elevHigh?: number | null;
	elevLow?: number | null;

	averageSpeed: number;
	maxSpeed: number;

	averageWatts?: number | null;
	deviceWatts?: boolean;
	kilojoules?: number | null;

	averageCadence?: number | null;
	averageHeartrate?: number | null;
	maxHeartrate?: number | null;
	hasHeartrate?: boolean;
	calories?: number | null;
	averageTemp?: number | null;

	polyline?: string | null;
	summaryPolyline?: string | null;
	startLatlng?: [number, number] | null;
	endLatlng?: [number, number] | null;

	trainer?: boolean;
	commute?: boolean;
	manual?: boolean;

	gearId?: string | null;

	splits?: Omit<ActivitySplitResponse, "paceZone">[];
}

export interface MonthlySummary {
	totalDistance: number; // meters
	totalMovingTime: number; // seconds
	activityCount: number;
	year: number;
	month: number;
}

export interface UpdateActivityRequest {
	name?: string;
	sportType?: string;
	startDate?: string | null;
	movingTime?: number;
	elapsedTime?: number;
	distance?: number;
	totalElevationGain?: number;
	elevHigh?: number | null;
	elevLow?: number | null;
	averageSpeed?: number;
	maxSpeed?: number;
	averageWatts?: number | null;
	calories?: number | null;
	polyline?: string | null;
	summaryPolyline?: string | null;
	trainer?: boolean;
	commute?: boolean;
}
