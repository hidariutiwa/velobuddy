"use client";

import { FavoriteList } from "@/components/favorites/FavoriteList";
import MainContainer from "@/components/layout/mainContainer";
import { FavoritePlace } from "@/types/place";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function FavoritesPage() {
	const { status } = useSession();
	const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			setIsLoading(false);
			return;
		}
		if (status !== "authenticated") {
			return;
		}

		const fetchFavorites = async () => {
			try {
				const response = await fetch("/api/favorites");
				const data: FavoritePlace[] = await response.json();
				setFavorites(data);
			} catch {
				setFavorites([]);
			} finally {
				setIsLoading(false);
			}
		};

		void fetchFavorites();
	}, [status]);

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
		<MainContainer>
			<div className="flex h-full w-full flex-col gap-4 p-4">
				<p className="text-lg font-bold text-zinc-700">
					お気に入りスポット
				</p>
				<div className="flex h-0 w-full grow flex-col gap-4 overflow-y-auto">
					<FavoriteList
						favorites={favorites}
						isLoading={isLoading}
						onVisitedToggle={handleVisitedToggle}
						onMemoUpdate={handleMemoUpdate}
						onDelete={handleDelete}
					/>
				</div>
			</div>
		</MainContainer>
	);
}
