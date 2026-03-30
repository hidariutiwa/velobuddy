"use client";

import Navigation from "@/components/layout/navigation";
import Link from "next/link";
import { useState } from "react";

interface Spot {
	id: string;
	name: string;
	category: string;
	area: string;
	rating: number;
	distance: string;
	isFavorite: boolean;
	isVisited: boolean;
}

const mockSpots: Spot[] = [
	{
		id: "1",
		name: "代々木公園",
		category: "公園",
		area: "東京都渋谷区",
		rating: 4.5,
		distance: "1.2km",
		isFavorite: true,
		isVisited: true,
	},
	{
		id: "2",
		name: "ブルーボトルコーヒー",
		category: "カフェ",
		area: "東京都渋谷区",
		rating: 4.3,
		distance: "0.8km",
		isFavorite: true,
		isVisited: false,
	},
	{
		id: "3",
		name: "明治神宮",
		category: "観光",
		area: "東京都渋谷区",
		rating: 4.7,
		distance: "2.0km",
		isFavorite: false,
		isVisited: false,
	},
	{
		id: "4",
		name: "表参道グルメ通り",
		category: "食事",
		area: "東京都港区",
		rating: 4.1,
		distance: "1.5km",
		isFavorite: false,
		isVisited: false,
	},
];

const filterCategories = ["すべて", "カフェ", "公園", "食事", "観光"] as const;
type FilterCategory = (typeof filterCategories)[number];

export default function SpotsPage() {
	const [activeFilter, setActiveFilter] = useState<FilterCategory>("すべて");
	const [query, setQuery] = useState("");

	const filteredSpots = mockSpots.filter((spot) => {
		const matchesCategory =
			activeFilter === "すべて" || spot.category === activeFilter;
		const matchesQuery =
			spot.name.includes(query) || spot.area.includes(query);
		return matchesCategory && matchesQuery;
	});

	return (
		<div className="mx-auto flex h-screen max-w-[390px] flex-col bg-white">
			{/* Header */}
			<div className="bg-white px-4 pt-11 pb-3 shadow-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Link
							href="/"
							className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M10 12L6 8L10 4" />
							</svg>
						</Link>
						<h1 className="text-xl font-bold text-zinc-900">
							スポット一覧
						</h1>
					</div>
					<button className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
						>
							<path d="M4 5H12M2 8H14M5 11H11" />
						</svg>
					</button>
				</div>
			</div>

			{/* Search bar */}
			<div className="bg-white px-4 pt-3">
				<div className="flex items-center gap-2 rounded-xl bg-zinc-100 px-3 py-2.5">
					<svg
						width="18"
						height="18"
						viewBox="0 0 18 18"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						className="text-zinc-400"
					>
						<circle cx="8" cy="8" r="5" />
						<path d="M13 13L16 16" />
					</svg>
					<input
						type="text"
						placeholder="スポットを検索..."
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full bg-transparent text-sm text-zinc-700 placeholder-zinc-400 outline-none"
					/>
				</div>
			</div>

			{/* Filter chips */}
			<div className="flex gap-2 overflow-x-auto bg-white px-4 py-3 [scrollbar-width:none]">
				{filterCategories.map((cat) => (
					<button
						key={cat}
						onClick={() => setActiveFilter(cat)}
						className={`rounded-full px-4 py-1.5 text-[13px] whitespace-nowrap transition-colors ${
							activeFilter === cat
								? "bg-blue-500 font-bold text-white"
								: "bg-zinc-100 font-normal text-zinc-700"
						}`}
					>
						{cat}
					</button>
				))}
			</div>

			<div className="h-px bg-zinc-100" />

			{/* Result count */}
			<p className="px-4 py-2.5 text-sm font-medium text-zinc-500">
				{filteredSpots.length}件のスポット
			</p>

			{/* Spot list */}
			<div className="flex-1 overflow-y-auto pb-20">
				{filteredSpots.map((spot) => (
					<Link key={spot.id} href={`/spots/${spot.id}`}>
						<div className="mx-4 mb-2 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-100">
							<div className="h-14 w-14 flex-shrink-0 rounded-xl bg-zinc-200" />
							<div className="min-w-0 flex-1">
								<p className="text-base font-bold text-zinc-900">
									{spot.name}
								</p>
								<p className="mt-0.5 text-[13px] text-zinc-500">
									{spot.category} · {spot.area}
								</p>
								<p className="mt-0.5 text-[13px] font-bold text-blue-600">
									★ {spot.rating}
								</p>
							</div>
							<div className="flex flex-col items-end gap-2">
								<span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[13px] font-medium text-zinc-600">
									{spot.distance}
								</span>
								<div className="flex items-center gap-2">
									{spot.isVisited && (
										<span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
											訪問済み
										</span>
									)}
									<button
										className={`text-base ${spot.isFavorite ? "text-blue-500" : "text-zinc-300"}`}
									>
										{spot.isFavorite ? "♥" : "♡"}
									</button>
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>

			<Navigation />
		</div>
	);
}
