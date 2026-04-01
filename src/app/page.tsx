"use client";
import MainContainer from "@/components/layout/mainContainer";
import GoogleMap from "@/components/map/GoogleMap";
import { PlaceBar } from "@/components/utils/place";
import { SearchBar } from "@/components/utils/search";
import { mockPlaces } from "@/types/map";
import { PlaceCache, PlaceSearchResponse } from "@/types/place";
import { useEffect, useState } from "react";

const categories = ["すべて", "カフェ", "公園", "食事", "観光"] as const;
type Category = (typeof categories)[number];

export default function Home() {
	const [activeCategory, setActiveCategory] = useState<Category>("すべて");
	const [userLocation, setUserLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [isLocating, setIsLocating] = useState(false);
	const [searchResults, setSearchResults] = useState<PlaceCache[]>([]);

	const locateUser = () => {
		if (typeof navigator === "undefined" || !navigator.geolocation) return;
		setIsLocating(true);
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setUserLocation({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
				});
				setIsLocating(false);
			},
			() => {
				setIsLocating(false);
			},
		);
	};

	useEffect(() => {
		if (typeof navigator === "undefined" || !navigator.geolocation) return;
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				setUserLocation({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude,
				});
			},
			() => {},
		);
	}, []);

	const handleSearch = async (query: string) => {
		try {
			const res = await fetch(
				`/api/places/search?q=${encodeURIComponent(query)}`,
			);
			if (!res.ok) return;
			const data: PlaceSearchResponse = await res.json();
			setSearchResults(data.places ?? []);
		} catch (err) {
			console.error(err);
		}
	};

	const searchMarkers =
		searchResults.length > 0
			? searchResults
					.filter(
						(
							place,
						): place is PlaceCache & {
							latitude: number;
							longitude: number;
						} =>
							place.latitude !== null && place.longitude !== null,
					)
					.map((place) => ({
						id: place.googlePlaceId,
						lat: place.latitude,
						lng: place.longitude,
						label: place.name,
					}))
			: null;

	const defaultMarkers = userLocation
		? [
				{
					id: "current-location",
					lat: userLocation.lat,
					lng: userLocation.lng,
					label: "現在地",
				},
			]
		: [
				{
					id: "yoyogi",
					lat: 35.6714,
					lng: 139.6956,
					label: "代々木公園",
				},
			];

	return (
		<MainContainer>
			<div className="flex h-full w-full flex-col items-center justify-start overflow-hidden">
				{/* Map background (full screen) */}
				<GoogleMap
					className="h-full w-full"
					center={userLocation ?? undefined}
					markers={searchMarkers ?? defaultMarkers}
				/>

				{/* Search bar + GPS button */}
				<div className="absolute top-24 right-0 left-0 flex items-center gap-2 px-4">
					<div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-3 shadow-md">
						<SearchBar onSearch={handleSearch} />
					</div>
					<button
						onClick={locateUser}
						className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-md ${isLocating ? "text-zinc-400" : "text-blue-500"}`}
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 20 20"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
						>
							<circle cx="10" cy="10" r="6" />
							<circle
								cx="10"
								cy="10"
								r="2"
								fill="currentColor"
								stroke="none"
							/>
							<path d="M10 2V4M10 16V18M2 10H4M16 10H18" />
						</svg>
					</button>
				</div>

				{/* Category chips */}
				<div className="absolute top-[172px] right-0 left-0 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
					{categories.map((cat) => (
						<button
							key={cat}
							onClick={() => setActiveCategory(cat)}
							className={`rounded-full px-4 py-1.5 text-[13px] whitespace-nowrap shadow-sm transition-colors ${
								activeCategory === cat
									? "bg-blue-500 font-bold text-white"
									: "bg-white font-normal text-zinc-700"
							}`}
						>
							{cat}
						</button>
					))}
				</div>
				<PlaceBar place={mockPlaces[0]} />
			</div>
		</MainContainer>
	);
}
