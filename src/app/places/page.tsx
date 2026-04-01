"use client";
import MainContainer from "@/components/layout/mainContainer";
import { PlaceCard } from "@/components/utils/place";
import { SearchBar } from "@/components/utils/search";
import { MapPlace } from "@/types/map";
import { FavoritePlace, PlaceCache, PlaceSearchResponse } from "@/types/place";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Page() {
  const [places, setPlaces] = useState<PlaceCache[]>([]);
  const { status } = useSession();
  const [favoritesMap, setFavoritesMap] = useState<Map<string, number>>(new Map());

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

  const handleFavoriteToggle = async (place: PlaceCache, favoriteId: number | null) => {
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
        setFavoritesMap((prev) => new Map(prev).set(place.googlePlaceId, data.id));
      } catch {
        // ignore
      }
    } else {
      try {
        const res = await fetch(`/api/favorites/${favoriteId}`, { method: "DELETE" });
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

  const cards = places.map((place, index) => {
    const mapPlace: MapPlace = { ...place, category: "観光" };
    return (
      <PlaceCard
        key={index}
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
        <div className="flex h-0 w-full grow flex-col justify-start gap-4 overflow-y-auto">
          {cards}
        </div>
      </div>
    </MainContainer>
  );
}
