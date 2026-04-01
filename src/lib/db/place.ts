import { PrismaClient } from "@/lib/generated/prisma/client";
import {
	AddFavoriteRequest,
	FavoritePlace,
	PlaceCache,
	UpdateFavoriteRequest,
} from "@/types/place";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

function mapPlaceCache(place: {
	id: number;
	googlePlaceId: string;
	name: string;
	latitude: number | null;
	longitude: number | null;
	address: string | null;
	imageUrl: string | null;
}): PlaceCache {
	return {
		id: place.id,
		googlePlaceId: place.googlePlaceId,
		name: place.name,
		latitude: place.latitude,
		longitude: place.longitude,
		address: place.address,
		imageUrl: place.imageUrl,
	};
}

function mapFavoritePlace(record: {
	id: number;
	visited: boolean;
	memo: string | null;
	createdAt: Date;
	updatedAt: Date;
	place: {
		id: number;
		googlePlaceId: string;
		name: string;
		latitude: number | null;
		longitude: number | null;
		address: string | null;
		imageUrl: string | null;
	};
}): FavoritePlace {
	return {
		id: record.id,
		place: mapPlaceCache(record.place),
		visited: record.visited,
		memo: record.memo,
		createdAt: record.createdAt.toISOString(),
		updatedAt: record.updatedAt.toISOString(),
	};
}

export async function upsertPlace(
	data: AddFavoriteRequest,
): Promise<PlaceCache> {
	try {
		const place = await prisma.place.upsert({
			where: { googlePlaceId: data.googlePlaceId },
			update: {
				name: data.name,
				latitude: data.latitude,
				longitude: data.longitude,
				address: data.address,
				imageUrl: data.imageUrl,
			},
			create: {
				googlePlaceId: data.googlePlaceId,
				name: data.name,
				latitude: data.latitude,
				longitude: data.longitude,
				address: data.address,
				imageUrl: data.imageUrl,
			},
		});
		return mapPlaceCache(place);
	} catch (error) {
		throw error;
	}
}

export async function createFavorite(
	userId: number,
	placeId: number,
): Promise<FavoritePlace> {
	try {
		const record = await prisma.userFavoritePlace.create({
			data: {
				userId,
				placeId,
			},
			include: { place: true },
		});
		return mapFavoritePlace(record);
	} catch (error) {
		throw error;
	}
}

export async function getFavoritesByUserId(
	userId: number,
): Promise<FavoritePlace[]> {
	try {
		const records = await prisma.userFavoritePlace.findMany({
			where: { userId },
			include: { place: true },
			orderBy: { createdAt: "desc" },
		});
		return records.map(mapFavoritePlace);
	} catch (error) {
		throw error;
	}
}

export async function updateFavorite(
	id: number,
	data: UpdateFavoriteRequest,
): Promise<FavoritePlace> {
	try {
		const record = await prisma.userFavoritePlace.update({
			where: { id },
			data: {
				...(data.visited !== undefined && { visited: data.visited }),
				...(data.memo !== undefined && { memo: data.memo }),
			},
			include: { place: true },
		});
		return mapFavoritePlace(record);
	} catch (error) {
		throw error;
	}
}

export async function deleteFavorite(
	id: number,
	userId: number,
): Promise<void> {
	try {
		await prisma.userFavoritePlace.deleteMany({
			where: { id, userId },
		});
	} catch (error) {
		throw error;
	}
}

export async function getFavoriteById(
	id: number,
): Promise<{ id: number; userId: number } | null> {
	try {
		const record = await prisma.userFavoritePlace.findUnique({
			where: { id },
			select: { id: true, userId: true },
		});
		return record;
	} catch (error) {
		throw error;
	}
}
