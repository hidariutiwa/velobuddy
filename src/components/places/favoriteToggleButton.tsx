"use client";

import { FavoritePlace, PlaceCache } from "@/types/place";
import { useState } from "react";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

export default function FavoriteToggleButton({
	place,
	initialFavoriteId,
}: {
	place: PlaceCache;
	initialFavoriteId: number | null;
}) {
	const [favoriteId, setFavoriteId] = useState<number | null>(
		initialFavoriteId,
	);

	const handleFavoriteToggle = async () => {
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
				setFavoriteId(data.id);
			} catch {
				// ignore
			}
		} else {
			try {
				const res = await fetch(`/api/favorites/${favoriteId}`, {
					method: "DELETE",
				});
				if (!res.ok) return;
				setFavoriteId(null);
			} catch {
				// ignore
			}
		}
	};

	return (
		<button
			type="button"
			onClick={handleFavoriteToggle}
			className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600"
			aria-label={
				favoriteId !== null ? "お気に入り解除" : "お気に入り追加"
			}
		>
			{favoriteId !== null ? <MdFavorite /> : <MdFavoriteBorder />}
		</button>
	);
}
