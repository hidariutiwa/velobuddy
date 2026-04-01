"use client";
import MainContainer from "@/components/layout/mainContainer";
import { PlaceCard } from "@/components/utils/place";
import { SearchBar } from "@/components/utils/search";
import { MapPlace } from "@/types/map";
import { PlaceCache, PlaceSearchResponse } from "@/types/place";
import { useState } from "react";

export default function Page() {
	const [places, setPlaces] = useState<PlaceCache[]>([]);

	const handleSearch = async (query: string) => {
		try {
			const res = await fetch(
				`/api/places/search?q=${encodeURIComponent(query)}`,
			);
			if (!res.ok) return;
			const data: PlaceSearchResponse = await res.json();
			setPlaces(data.places ?? []);
		} catch (err) {
			console.error(err);
		}
	};

	const cards = places.map((place, index) => {
		const mapPlace: MapPlace = { ...place, category: "観光" };
		return <PlaceCard key={index} place={mapPlace} />;
	});

	return (
		<MainContainer>
			<div className="flex h-full w-full flex-col items-center justify-start gap-4 p-4">
				<SearchBar onSearch={handleSearch} />
				<div className="flex h-0 w-full grow flex-col justify-start gap-4 overflow-y-auto">
					{cards}
				</div>
			</div>
		</MainContainer>
	);
}
