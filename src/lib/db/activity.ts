import { PrismaClient } from "@/lib/generated/prisma/client";
import {
	ActivityResponse,
	ActivitySplitResponse,
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

type ActivityRecord = NonNullable<
	Awaited<ReturnType<typeof prisma.activity.findUnique>>
>;

function mapActivity(
	record: ActivityRecord & {
		splits?: {
			split: number;
			distance: number;
			elapsedTime: number;
			movingTime: number;
			elevationDifference: number;
			averageSpeed: number;
			paceZone: number;
		}[];
	},
): ActivityResponse {
	return {
		id: record.id,
		stravaId: record.stravaId ? record.stravaId.toString() : null,
		source: record.source,
		name: record.name,
		sportType: record.sportType,
		startDate: record.startDate ? record.startDate.toISOString() : null,
		timezone: record.timezone,
		movingTime: record.movingTime,
		elapsedTime: record.elapsedTime,
		distance: record.distance,
		totalElevationGain: record.totalElevationGain,
		elevHigh: record.elevHigh,
		elevLow: record.elevLow,
		averageSpeed: record.averageSpeed,
		maxSpeed: record.maxSpeed,
		averageWatts: record.averageWatts,
		deviceWatts: record.deviceWatts,
		kilojoules: record.kilojoules,
		averageCadence: record.averageCadence,
		averageHeartrate: record.averageHeartrate,
		maxHeartrate: record.maxHeartrate,
		hasHeartrate: record.hasHeartrate,
		calories: record.calories,
		averageTemp: record.averageTemp,
		polyline: record.polyline,
		summaryPolyline: record.summaryPolyline,
		startLatlng: record.startLatlng as [number, number] | null,
		endLatlng: record.endLatlng as [number, number] | null,
		trainer: record.trainer,
		commute: record.commute,
		manual: record.manual,
		gearId: record.gearId,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
		splits: record.splits?.map(mapSplit),
	};
}

function mapSplit(record: {
	split: number;
	distance: number;
	elapsedTime: number;
	movingTime: number;
	elevationDifference: number;
	averageSpeed: number;
	paceZone: number;
}): ActivitySplitResponse {
	return {
		split: record.split,
		distance: record.distance,
		elapsedTime: record.elapsedTime,
		movingTime: record.movingTime,
		elevationDifference: record.elevationDifference,
		averageSpeed: record.averageSpeed,
		paceZone: record.paceZone,
	};
}

export async function getActivitiesByUserId(
	userId: number,
): Promise<ActivityResponse[]> {
	const records = await prisma.activity.findMany({
		where: { userId },
		orderBy: { startDate: "desc" },
	});
	return records.map((r) => mapActivity(r));
}

export async function getActivityById(
	id: number,
): Promise<ActivityResponse | null> {
	const record = await prisma.activity.findUnique({
		where: { id },
		include: { splits: { orderBy: { split: "asc" } } },
	});
	return record ? mapActivity(record) : null;
}

export async function createActivity(
	userId: number,
	data: CreateActivityRequest,
): Promise<ActivityResponse> {
	const record = await prisma.activity.create({
		data: {
			userId,
			stravaId: data.stravaId ? BigInt(data.stravaId) : null,
			externalId: data.externalId ?? null,
			source: data.source ?? "manual",
			name: data.name ?? "",
			sportType: data.sportType ?? "Ride",
			startDate: data.startDate ? new Date(data.startDate) : null,
			timezone: data.timezone ?? null,
			movingTime: data.movingTime,
			elapsedTime: data.elapsedTime,
			distance: data.distance,
			totalElevationGain: data.totalElevationGain ?? 0,
			elevHigh: data.elevHigh ?? null,
			elevLow: data.elevLow ?? null,
			averageSpeed: data.averageSpeed,
			maxSpeed: data.maxSpeed,
			averageWatts: data.averageWatts ?? null,
			deviceWatts: data.deviceWatts ?? false,
			kilojoules: data.kilojoules ?? null,
			averageCadence: data.averageCadence ?? null,
			averageHeartrate: data.averageHeartrate ?? null,
			maxHeartrate: data.maxHeartrate ?? null,
			hasHeartrate: data.hasHeartrate ?? false,
			calories: data.calories ?? null,
			averageTemp: data.averageTemp ?? null,
			polyline: data.polyline ?? null,
			summaryPolyline: data.summaryPolyline ?? null,
			startLatlng: data.startLatlng ?? undefined,
			endLatlng: data.endLatlng ?? undefined,
			trainer: data.trainer ?? false,
			commute: data.commute ?? false,
			manual: data.manual ?? false,
			gearId: data.gearId ?? null,
			splits: data.splits
				? {
						create: data.splits.map((s) => ({
							split: s.split,
							distance: s.distance,
							elapsedTime: s.elapsedTime,
							movingTime: s.movingTime,
							elevationDifference: s.elevationDifference,
							averageSpeed: s.averageSpeed,
						})),
					}
				: undefined,
		},
		include: { splits: { orderBy: { split: "asc" } } },
	});
	return mapActivity(record);
}

export async function updateActivity(
	id: number,
	data: UpdateActivityRequest,
): Promise<ActivityResponse> {
	const record = await prisma.activity.update({
		where: { id },
		data: {
			...(data.name !== undefined && { name: data.name }),
			...(data.sportType !== undefined && { sportType: data.sportType }),
			...(data.startDate !== undefined && {
				startDate: data.startDate ? new Date(data.startDate) : null,
			}),
			...(data.movingTime !== undefined && {
				movingTime: data.movingTime,
			}),
			...(data.elapsedTime !== undefined && {
				elapsedTime: data.elapsedTime,
			}),
			...(data.distance !== undefined && { distance: data.distance }),
			...(data.totalElevationGain !== undefined && {
				totalElevationGain: data.totalElevationGain,
			}),
			...(data.elevHigh !== undefined && { elevHigh: data.elevHigh }),
			...(data.elevLow !== undefined && { elevLow: data.elevLow }),
			...(data.averageSpeed !== undefined && {
				averageSpeed: data.averageSpeed,
			}),
			...(data.maxSpeed !== undefined && { maxSpeed: data.maxSpeed }),
			...(data.averageWatts !== undefined && {
				averageWatts: data.averageWatts,
			}),
			...(data.calories !== undefined && { calories: data.calories }),
			...(data.polyline !== undefined && { polyline: data.polyline }),
			...(data.summaryPolyline !== undefined && {
				summaryPolyline: data.summaryPolyline,
			}),
			...(data.trainer !== undefined && { trainer: data.trainer }),
			...(data.commute !== undefined && { commute: data.commute }),
		},
		include: { splits: { orderBy: { split: "asc" } } },
	});
	return mapActivity(record);
}

export async function deleteActivity(
	id: number,
	userId: number,
): Promise<void> {
	await prisma.activity.deleteMany({
		where: { id, userId },
	});
}

export async function getActivityOwner(
	id: number,
): Promise<{ id: number; userId: number } | null> {
	return prisma.activity.findUnique({
		where: { id },
		select: { id: true, userId: true },
	});
}
