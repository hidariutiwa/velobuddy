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
	priceLevel?: string;
	regularOpeningHours?: {
		openNow?: boolean;
		periods?: Array<{
			open: { day: number; hour: number; minute: number };
			close?: { day: number; hour: number; minute: number };
		}>;
		weekdayDescriptions?: string[];
	};
	types?: string[];
}

export interface GooglePlacesTextSearchApiResponse {
	places: GooglePlacesTextSearchResult[];
}
