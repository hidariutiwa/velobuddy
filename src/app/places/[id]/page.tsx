"use client";

import MainContainer from "@/components/layout/mainContainer";
import { FavoritePlace, PlaceCache } from "@/types/place";
import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

export default function Page() {
	const { id } = useParams<{ id: string }>();
	const { status } = useSession();
	const [place, setPlace] = useState<PlaceCache | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [favoriteId, setFavoriteId] = useState<number | null>(null);

	useEffect(() => {
		const fetchPlace = async () => {
			try {
				const res = await fetch(`/api/places/${id}`);
				if (!res.ok) {
					setError(true);
					return;
				}
				const data: PlaceCache = await res.json();
				setPlace(data);
			} catch {
				setError(true);
			} finally {
				setLoading(false);
			}
		};
		void fetchPlace();
	}, [id]);

	useEffect(() => {
		if (status !== "authenticated" || place === null) return;
		const fetchFavorites = async () => {
			try {
				const res = await fetch("/api/favorites");
				if (!res.ok) return;
				const data: FavoritePlace[] = await res.json();
				const fav = data.find(
					(f) => f.place.googlePlaceId === place.googlePlaceId,
				);
				if (fav) setFavoriteId(fav.id);
			} catch {
				// ignore
			}
		};
		void fetchFavorites();
	}, [status, place]);

	const handleFavoriteToggle = async () => {
		if (place === null) return;
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

	if (loading) {
		return (
			<MainContainer>
				<div className="flex h-full w-full items-center justify-center">
					<p className="text-zinc-400">読み込み中...</p>
				</div>
			</MainContainer>
		);
	}

	if (error || place === null) {
		return (
			<MainContainer>
				<div className="flex h-full w-full items-center justify-center">
					<p className="text-zinc-400">場所が見つかりませんでした</p>
				</div>
			</MainContainer>
		);
	}

	const hasLocation = place.latitude !== null && place.longitude !== null;

	return (
		<MainContainer>
			<div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-4">
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-zinc-800">
						{place.name}
					</h1>
					{status === "authenticated" && (
						<button
							type="button"
							onClick={handleFavoriteToggle}
							className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600"
							aria-label={
								favoriteId !== null
									? "お気に入り解除"
									: "お気に入り追加"
							}
						>
							{favoriteId !== null ? (
								<MdFavorite />
							) : (
								<MdFavoriteBorder />
							)}
						</button>
					)}
				</div>

				{place.address && (
					<p className="text-sm text-zinc-500">{place.address}</p>
				)}

				{hasLocation && (
					<div className="h-64 w-full overflow-hidden rounded-lg">
						<APIProvider
							apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!}
						>
							<Map
								mapId="DEMO_MAP_ID"
								defaultCenter={{
									lat: place.latitude!,
									lng: place.longitude!,
								}}
								defaultZoom={15}
								gestureHandling="greedy"
								disableDefaultUI={false}
								style={{ width: "100%", height: "100%" }}
							>
								<AdvancedMarker
									position={{
										lat: place.latitude!,
										lng: place.longitude!,
									}}
								/>
							</Map>
						</APIProvider>
					</div>
				)}
			</div>
		</MainContainer>
	);
}
