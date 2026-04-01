export interface PlaceCache {
	id: number;
	googlePlaceId: string;
	name: string;
	latitude: number | null;
	longitude: number | null;
	address: string | null;
	imageUrl: string | null;
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
}

export interface UpdateFavoriteRequest {
	visited?: boolean;
	memo?: string | null;
}

export interface PlaceSearchResponse {
	places: PlaceCache[];
}
