import { PrismaClient } from "@/lib/generated/prisma/client";
import {
	AddFavoriteRequest,
	FavoritePlace,
	FilterOptions,
	OpeningHours,
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

function parseOpeningHours(raw: string | null): OpeningHours | null {
	if (raw === null) return null;
	try {
		return JSON.parse(raw) as OpeningHours;
	} catch {
		return null;
	}
}

function mapPlaceCache(place: {
	id: number;
	googlePlaceId: string;
	name: string;
	latitude: number | null;
	longitude: number | null;
	address: string | null;
	imageUrl: string | null;
	priceLevel: string | null;
	openingHours: string | null;
	categories: { id: number; name: string }[];
}): PlaceCache {
	return {
		id: place.id,
		googlePlaceId: place.googlePlaceId,
		name: place.name,
		latitude: place.latitude,
		longitude: place.longitude,
		address: place.address,
		imageUrl: place.imageUrl,
		priceLevel: place.priceLevel,
		openingHours: parseOpeningHours(place.openingHours),
		categories: place.categories.map((c) => c.name),
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
		priceLevel: string | null;
		openingHours: string | null;
		categories: { id: number; name: string }[];
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
		const categoryConnections =
			data.categoryNames !== undefined && data.categoryNames.length > 0
				? data.categoryNames.map((name) => ({
						where: { name },
						create: { name },
					}))
				: undefined;

		const place = await prisma.place.upsert({
			where: { googlePlaceId: data.googlePlaceId },
			update: {
				name: data.name,
				latitude: data.latitude,
				longitude: data.longitude,
				address: data.address,
				imageUrl: data.imageUrl,
				priceLevel: data.priceLevel ?? undefined,
				openingHours: data.openingHours ?? undefined,
				...(categoryConnections !== undefined && {
					categories: { connectOrCreate: categoryConnections },
				}),
			},
			create: {
				googlePlaceId: data.googlePlaceId,
				name: data.name,
				latitude: data.latitude,
				longitude: data.longitude,
				address: data.address,
				imageUrl: data.imageUrl,
				priceLevel: data.priceLevel ?? null,
				openingHours: data.openingHours ?? null,
				...(categoryConnections !== undefined && {
					categories: { connectOrCreate: categoryConnections },
				}),
			},
			include: { categories: true },
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
			include: { place: { include: { categories: true } } },
		});
		return mapFavoritePlace(record);
	} catch (error) {
		throw error;
	}
}

export async function getFavoritesByUserId(
	userId: number,
	filter?: FilterOptions,
): Promise<FavoritePlace[]> {
	try {
		const where: {
			userId: number;
			visited?: boolean;
			place?: {
				categories?: { some: { name: string } };
				priceLevel?: string;
			};
		} = { userId };

		if (filter !== undefined) {
			if (filter.visited !== undefined) {
				where.visited = filter.visited;
			}
			if (
				filter.category !== undefined ||
				filter.priceLevel !== undefined
			) {
				where.place = {};
				if (filter.category !== undefined) {
					where.place.categories = {
						some: { name: filter.category },
					};
				}
				if (filter.priceLevel !== undefined) {
					where.place.priceLevel = filter.priceLevel;
				}
			}
		}

		const records = await prisma.userFavoritePlace.findMany({
			where,
			include: { place: { include: { categories: true } } },
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
			include: { place: { include: { categories: true } } },
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

export async function getPlaceById(id: number): Promise<PlaceCache | null> {
	try {
		const place = await prisma.place.findUnique({
			where: { id },
			include: { categories: true },
		});
		if (place === null) return null;
		return mapPlaceCache(place);
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
