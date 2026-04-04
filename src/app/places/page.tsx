"use client";
import { FilterBar } from "@/components/filter/FilterBar";
import MainContainer from "@/components/layout/mainContainer";
import { PlaceCard } from "@/components/utils/place";
import { SearchBar } from "@/components/utils/search";
import { isOpenNow } from "@/lib/utils/openingHours";
import { MapPlace } from "@/types/map";
import {
	FavoritePlace,
	FilterOptions,
	PlaceCache,
	PlaceSearchResponse,
} from "@/types/place";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

export default function Page() {
	const [places, setPlaces] = useState<PlaceCache[]>([]);
	const [filter, setFilter] = useState<FilterOptions>({});
	const { status } = useSession();
	const [favoritesMap, setFavoritesMap] = useState<Map<string, number>>(
		new Map(),
	);
	const [favoritesDetail, setFavoritesDetail] = useState<FavoritePlace[]>([]);

	useEffect(() => {
		if (status !== "authenticated") return;
		const fetchFavorites = async () => {
			try {
				const res = await fetch("/api/favorites");
				if (!res.ok) return;
				const data: FavoritePlace[] = await res.json();
				const map = new Map<string, number>();
				data.forEach((f) => map.set(f.place.googlePlaceId, f.id));
				setFavoritesMap(map);
				setFavoritesDetail(data);
			} catch {
				// ignore
			}
		};
		void fetchFavorites();
	}, [status]);

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

	const handleFavoriteToggle = async (
		place: PlaceCache,
		favoriteId: number | null,
	) => {
		if (favoriteId === null) {
			try {
				const res = await fetch("/api/favorites", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						googlePlaceId: place.googlePlaceId,
						name: place.name,
						latitude: place.latitude,
						longitude: place.longitude,
						address: place.address,
						imageUrl: place.imageUrl,
					}),
				});
				if (!res.ok) return;
				const data: FavoritePlace = await res.json();
				setFavoritesMap((prev) =>
					new Map(prev).set(place.googlePlaceId, data.id),
				);
			} catch {
				// ignore
			}
		} else {
			try {
				const res = await fetch(`/api/favorites/${favoriteId}`, {
					method: "DELETE",
				});
				if (!res.ok) return;
				setFavoritesMap((prev) => {
					const next = new Map(prev);
					next.delete(place.googlePlaceId);
					return next;
				});
			} catch {
				// ignore
			}
		}
	};

	const visitedMap = useMemo(() => {
		const map = new Map<string, boolean>();
		favoritesDetail.forEach((f) =>
			map.set(f.place.googlePlaceId, f.visited),
		);
		return map;
	}, [favoritesDetail]);

	const filteredPlaces = useMemo(() => {
		return places.filter((place) => {
			if (
				filter.category &&
				!place.categories.includes(filter.category)
			) {
				return false;
			}
			if (filter.priceLevel && place.priceLevel !== filter.priceLevel) {
				return false;
			}
			if (filter.isFavorite && !favoritesMap.has(place.googlePlaceId)) {
				return false;
			}
			if (filter.openNow && !isOpenNow(place.openingHours)) {
				return false;
			}
			if (filter.visited === true) {
				if (visitedMap.get(place.googlePlaceId) !== true) return false;
			}
			if (filter.visited === false) {
				if (visitedMap.get(place.googlePlaceId) === true) return false;
			}
			return true;
		});
	}, [places, filter, favoritesMap, visitedMap]);

	const cards = filteredPlaces.map((place) => {
		const category = place.categories[0] ?? "観光";
		const mapPlace: MapPlace = {
			...place,
			category: category as MapPlace["category"],
		};
		return (
			<PlaceCard
				key={place.googlePlaceId}
				place={mapPlace}
				isFavorite={favoritesMap.has(place.googlePlaceId)}
				favoriteId={favoritesMap.get(place.googlePlaceId) ?? null}
				onFavoriteToggle={handleFavoriteToggle}
			/>
		);
	});

	return (
		<MainContainer>
			<div className="flex h-full w-full flex-col items-center justify-start gap-4 p-4">
				<SearchBar onSearch={handleSearch} />
				<FilterBar
					filter={filter}
					onChange={setFilter}
					showFavoriteFilter={true}
				/>
				<div className="flex h-0 w-full grow flex-col justify-start gap-4 overflow-y-auto">
					{cards}
				</div>
			</div>
		</MainContainer>
	);
}
