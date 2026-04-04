export interface ActivityResponse {
	id: number;
	activityAt: string | null;
	distance: number;
	averageVelocity: number;
	maxVelocity: number;
	elevation: number;
	burnCalories: number;
	drivingTime: number;
	polyline: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface CreateActivityRequest {
	activityAt?: string | null;
	distance: number;
	averageVelocity: number;
	maxVelocity: number;
	elevation: number;
	burnCalories: number;
	drivingTime: number;
	polyline?: string | null;
}

export interface UpdateActivityRequest {
	activityAt?: string | null;
	distance?: number;
	averageVelocity?: number;
	maxVelocity?: number;
	elevation?: number;
	burnCalories?: number;
	drivingTime?: number;
	polyline?: string | null;
}
