"use client";

import { FavoritePlace } from "@/types/place";
import { useState } from "react";

const PRICE_LABEL: Record<string, string> = {
	PRICE_LEVEL_INEXPENSIVE: "¥",
	PRICE_LEVEL_MODERATE: "¥¥",
	PRICE_LEVEL_EXPENSIVE: "¥¥¥",
	PRICE_LEVEL_VERY_EXPENSIVE: "¥¥¥¥",
};

interface PlaceCardProps {
	favorite: FavoritePlace;
	onVisitedToggle: (id: number, visited: boolean) => void;
	onMemoUpdate: (id: number, memo: string | null) => void;
	onDelete: (id: number) => void;
}

function PlaceNoImage() {
	return (
		<div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-zinc-300">
			<p className="text-xs text-white">No Image</p>
		</div>
	);
}

export function PlaceCard({
	favorite,
	onVisitedToggle,
	onMemoUpdate,
	onDelete,
}: PlaceCardProps) {
	const [memoValue, setMemoValue] = useState(favorite.memo ?? "");

	const handleMemoBlur = () => {
		onMemoUpdate(
			favorite.id,
			memoValue.trim() !== "" ? memoValue.trim() : null,
		);
	};

	return (
		<div className="flex w-full flex-col gap-3 rounded-xl bg-white p-4 shadow">
			<div className="flex w-full items-start gap-4">
				{favorite.place.imageUrl ? (
					<img
						src={favorite.place.imageUrl}
						alt={favorite.place.name}
						className="h-16 w-16 shrink-0 rounded-xl object-cover"
					/>
				) : (
					<PlaceNoImage />
				)}
				<div className="flex min-w-0 grow flex-col gap-0.5">
					<p className="truncate text-base font-bold text-zinc-700">
						{favorite.place.name}
					</p>
					{favorite.place.address && (
						<p className="text-sm text-zinc-500">
							{favorite.place.address}
						</p>
					)}
				</div>
				<button
					type="button"
					onClick={() => onDelete(favorite.id)}
					className="shrink-0 text-sm text-zinc-400 hover:text-zinc-600"
					aria-label="削除"
				>
					削除
				</button>
			</div>

			<div className="flex items-center gap-3">
				<button
					type="button"
					onClick={() =>
						onVisitedToggle(favorite.id, !favorite.visited)
					}
					className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
						favorite.visited
							? "bg-blue-600 text-white"
							: "bg-zinc-100 text-zinc-500"
					}`}
				>
					{favorite.visited ? "訪問済み" : "未訪問"}
				</button>
				{(favorite.place.categories.length > 0 ||
					favorite.place.priceLevel) && (
					<span className="text-xs text-zinc-500">
						{[
							favorite.place.categories[0],
							favorite.place.priceLevel
								? PRICE_LABEL[favorite.place.priceLevel]
								: null,
						]
							.filter(Boolean)
							.join(" · ")}
					</span>
				)}
				{favorite.place.openingHours?.openNow === true && (
					<span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
						営業中
					</span>
				)}
			</div>

			<textarea
				value={memoValue}
				onChange={(e) => setMemoValue(e.target.value)}
				onBlur={handleMemoBlur}
				placeholder="メモを入力..."
				rows={2}
				className="w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none"
			/>
		</div>
	);
}
