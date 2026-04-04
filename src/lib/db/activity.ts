import { PrismaClient } from "@/lib/generated/prisma/client";
import {
	ActivityResponse,
	CreateActivityRequest,
	UpdateActivityRequest,
} from "@/types/activity";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

function mapActivity(record: {
	id: number;
	activityAt: Date | null;
	distance: number;
	averageVelocity: number;
	maxVelocity: number;
	elevation: number;
	burnCalories: number;
	drivingTime: number;
	polyline: string | null;
	createdAt: Date;
	updatedAt: Date;
}): ActivityResponse {
	return {
		id: record.id,
		activityAt: record.activityAt ? record.activityAt.toISOString() : null,
		distance: record.distance,
		averageVelocity: record.averageVelocity,
		maxVelocity: record.maxVelocity,
		elevation: record.elevation,
		burnCalories: record.burnCalories,
		drivingTime: record.drivingTime,
		polyline: record.polyline,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

export async function getActivitiesByUserId(
	userId: number,
): Promise<ActivityResponse[]> {
	try {
		const records = await prisma.activity.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
		});
		return records.map(mapActivity);
	} catch (error) {
		throw error;
	}
}

export async function getActivityById(
	id: number,
): Promise<ActivityResponse | null> {
	try {
		const record = await prisma.activity.findUnique({
			where: { id },
		});
		return record ? mapActivity(record) : null;
	} catch (error) {
		throw error;
	}
}

export async function createActivity(
	userId: number,
	data: CreateActivityRequest,
): Promise<ActivityResponse> {
	try {
		const record = await prisma.activity.create({
			data: {
				userId,
				activityAt: data.activityAt ? new Date(data.activityAt) : null,
				distance: data.distance,
				averageVelocity: data.averageVelocity,
				maxVelocity: data.maxVelocity,
				elevation: data.elevation,
				burnCalories: data.burnCalories,
				drivingTime: data.drivingTime,
				polyline: data.polyline ?? null,
			},
		});
		return mapActivity(record);
	} catch (error) {
		throw error;
	}
}

export async function updateActivity(
	id: number,
	data: UpdateActivityRequest,
): Promise<ActivityResponse> {
	try {
		const record = await prisma.activity.update({
			where: { id },
			data: {
				...(data.activityAt !== undefined && {
					activityAt: data.activityAt
						? new Date(data.activityAt)
						: null,
				}),
				...(data.distance !== undefined && { distance: data.distance }),
				...(data.averageVelocity !== undefined && {
					averageVelocity: data.averageVelocity,
				}),
				...(data.maxVelocity !== undefined && {
					maxVelocity: data.maxVelocity,
				}),
				...(data.elevation !== undefined && {
					elevation: data.elevation,
				}),
				...(data.burnCalories !== undefined && {
					burnCalories: data.burnCalories,
				}),
				...(data.drivingTime !== undefined && {
					drivingTime: data.drivingTime,
				}),
				...(data.polyline !== undefined && {
					polyline: data.polyline ?? null,
				}),
			},
		});
		return mapActivity(record);
	} catch (error) {
		throw error;
	}
}

export async function deleteActivity(
	id: number,
	userId: number,
): Promise<void> {
	try {
		await prisma.activity.deleteMany({
			where: { id, userId },
		});
	} catch (error) {
		throw error;
	}
}

export async function getActivityOwner(
	id: number,
): Promise<{ id: number; userId: number } | null> {
	try {
		const record = await prisma.activity.findUnique({
			where: { id },
			select: { id: true, userId: true },
		});
		return record;
	} catch (error) {
		throw error;
	}
}
