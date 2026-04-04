export interface OpeningHours {
	openNow?: boolean;
	periods?: Array<{
		open: { day: number; hour: number; minute: number };
		close?: { day: number; hour: number; minute: number };
	}>;
	weekdayDescriptions?: string[];
}

export type PlaceCategory =
	| "公園"
	| "温泉"
	| "銭湯"
	| "食事"
	| "カフェ"
	| "観光";

export interface FilterOptions {
	category?: PlaceCategory;
	priceLevel?: string;
	visited?: boolean;
	openNow?: boolean;
	isFavorite?: boolean;
}

export interface PlaceCache {
	id: number;
	googlePlaceId: string;
	name: string;
	latitude: number | null;
	longitude: number | null;
	address: string | null;
	imageUrl: string | null;
	priceLevel: string | null;
	openingHours: OpeningHours | null;
	categories: string[];
}

export interface FavoritePlace {
	id: number;
	place: PlaceCache;
	visited: boolean;
	memo: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AddFavoriteRequest {
	googlePlaceId: string;
	name: string;
	latitude: number | null;
	longitude: number | null;
	address: string | null;
	imageUrl: string | null;
	priceLevel?: string | null;
	openingHours?: string | null;
	categoryNames?: string[];
}

export interface UpdateFavoriteRequest {
	visited?: boolean;
	memo?: string | null;
}

export interface PlaceSearchResponse {
	places: PlaceCache[];
}
