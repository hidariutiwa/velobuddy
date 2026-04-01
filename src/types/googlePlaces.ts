export interface GooglePlacesTextSearchResult {
	id: string;
	displayName: {
		text: string;
		languageCode: string;
	};
	formattedAddress: string | null;
	location: {
		latitude: number;
		longitude: number;
	} | null;
	photos: Array<{
		name: string;
	}> | null;
}

export interface GooglePlacesTextSearchApiResponse {
	places: GooglePlacesTextSearchResult[];
}
