"use client";

import { FavoriteList } from "@/components/favorites/FavoriteList";
import { FilterBar } from "@/components/filter/FilterBar";
import { isOpenNow } from "@/lib/utils/openingHours";
import { FavoritePlace, FilterOptions } from "@/types/place";
import { useEffect, useMemo, useState } from "react";

export default function FavoritesPageClient({
	initialFavorites,
}: {
	initialFavorites: FavoritePlace[];
}) {
	const [favorites, setFavorites] =
		useState<FavoritePlace[]>(initialFavorites);
	const [isLoading, setIsLoading] = useState(false);
	const [filter, setFilter] = useState<FilterOptions>({});

	const hasActiveFilters =
		filter.category !== undefined ||
		filter.priceLevel !== undefined ||
		filter.visited !== undefined ||
		filter.openNow === true;

	useEffect(() => {
		const fetchFavorites = async () => {
			setIsLoading(true);
			try {
				const params = new URLSearchParams();
				if (filter.category) params.set("category", filter.category);
				if (filter.priceLevel)
					params.set("priceLevel", filter.priceLevel);
				if (filter.visited === true) params.set("visited", "true");
				if (filter.visited === false) params.set("visited", "false");
				const qs = params.toString();
				const url = `/api/favorites${qs ? `?${qs}` : ""}`;
				const response = await fetch(url);
				const data: FavoritePlace[] = await response.json();
				setFavorites(data);
			} catch {
				setFavorites([]);
			} finally {
				setIsLoading(false);
			}
		};

		if (hasActiveFilters) {
			void fetchFavorites();
		} else {
			setFavorites(initialFavorites);
		}
	}, [filter, hasActiveFilters, initialFavorites]);

	const filteredFavorites = useMemo(() => {
		if (!filter.openNow) return favorites;
		return favorites.filter((f) => isOpenNow(f.place.openingHours));
	}, [favorites, filter.openNow]);

	const handleVisitedToggle = async (id: number, visited: boolean) => {
		await fetch(`/api/favorites/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ visited }),
		});
		setFavorites((prev) =>
			prev.map((f) => (f.id === id ? { ...f, visited } : f)),
		);
	};

	const handleMemoUpdate = async (id: number, memo: string | null) => {
		await fetch(`/api/favorites/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ memo }),
		});
		setFavorites((prev) =>
			prev.map((f) => (f.id === id ? { ...f, memo } : f)),
		);
	};

	const handleDelete = async (id: number) => {
		await fetch(`/api/favorites/${id}`, { method: "DELETE" });
		setFavorites((prev) => prev.filter((f) => f.id !== id));
	};

	return (
		<div className="flex h-full w-full flex-col gap-4 p-4">
			<p className="text-lg font-bold text-zinc-700">
				お気に入りスポット
			</p>
			<FilterBar
				filter={filter}
				onChange={setFilter}
				showFavoriteFilter={false}
			/>
			{!isLoading && (
				<p className="text-sm text-zinc-500">
					フィルター結果: {filteredFavorites.length}件
				</p>
			)}
			<div className="flex h-0 w-full grow flex-col gap-4 overflow-y-auto">
				<FavoriteList
					favorites={filteredFavorites}
					isLoading={isLoading}
					hasActiveFilters={hasActiveFilters}
					onVisitedToggle={handleVisitedToggle}
					onMemoUpdate={handleMemoUpdate}
					onDelete={handleDelete}
				/>
			</div>
		</div>
	);
}
