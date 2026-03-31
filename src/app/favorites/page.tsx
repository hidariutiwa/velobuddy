"use client";

import { Header } from "@/components/layout/header";
import Navigation from "@/components/layout/navigation";
import Link from "next/link";
import { useState } from "react";

interface FavoriteSpot {
	id: string;
	name: string;
	category: string;
	area: string;
	rating: number;
	isVisited: boolean;
	memo?: string;
}

const mockFavorites: FavoriteSpot[] = [
	{
		id: "1",
		name: "代々木公園",
		category: "公園",
		area: "渋谷区",
		rating: 4.5,
		isVisited: true,
		memo: "サイクリングコース有り",
	},
	{
		id: "2",
		name: "ブルーボトルコーヒー",
		category: "カフェ",
		area: "渋谷区",
		rating: 4.3,
		isVisited: false,
	},
	{
		id: "3",
		name: "明治神宮",
		category: "観光",
		area: "渋谷区",
		rating: 4.7,
		isVisited: true,
		memo: "早朝サイクリングに最適",
	},
	{
		id: "4",
		name: "表参道グルメ通り",
		category: "食事",
		area: "港区",
		rating: 4.1,
		isVisited: false,
	},
	{
		id: "5",
		name: "井の頭公園",
		category: "公園",
		area: "武蔵野市",
		rating: 4.6,
		isVisited: false,
	},
];

const tabs = ["すべて", "訪問済み", "未訪問"] as const;
type Tab = (typeof tabs)[number];

export default function FavoritesPage() {
	const [activeTab, setActiveTab] = useState<Tab>("すべて");

	const filteredFavorites = mockFavorites.filter((spot) => {
		if (activeTab === "訪問済み") return spot.isVisited;
		if (activeTab === "未訪問") return !spot.isVisited;
		return true;
	});

	return (
		<div className="mx-auto flex h-screen max-w-[390px] flex-col bg-blue-50">
			<Header variant="page" title="お気に入り" />

			{/* Tabs */}
			<div className="relative flex bg-white">
				{tabs.map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`flex-1 py-3 text-[14px] transition-colors ${
							activeTab === tab
								? "font-bold text-blue-600"
								: "font-normal text-zinc-400"
						}`}
					>
						{tab}
					</button>
				))}
				{/* Active indicator bar */}
				<div
					className="absolute bottom-0 h-[3px] rounded-sm bg-blue-500 transition-all"
					style={{
						width: `${100 / tabs.length}%`,
						left: `${(tabs.indexOf(activeTab) * 100) / tabs.length}%`,
					}}
				/>
			</div>
			<div className="h-px bg-zinc-200" />

			{/* Favorites list */}
			<div className="flex-1 overflow-y-auto pb-20">
				<div className="mt-2 space-y-2 px-4">
					{filteredFavorites.map((spot) => (
						<Link key={spot.id} href={`/spots/${spot.id}`}>
							<div className="flex items-stretch overflow-hidden rounded-xl bg-white shadow-sm">
								{/* Thumbnail */}
								<div className="relative flex-shrink-0">
									<div className="h-full w-[76px] bg-zinc-200" />
									<div className="absolute top-0 right-0 h-full w-3 bg-white" />
								</div>

								{/* Content */}
								<div className="flex flex-1 items-start justify-between px-3 py-3">
									<div className="min-w-0 flex-1">
										<p className="text-[15px] font-bold text-zinc-900">
											{spot.name}
										</p>
										<p className="mt-0.5 text-[11px] text-zinc-500">
											{spot.category} · {spot.area}
										</p>
										<p className="mt-0.5 text-[12px] font-bold text-blue-600">
											★ {spot.rating}
										</p>
										{spot.memo !== undefined && (
											<p className="mt-0.5 text-[11px] text-zinc-400">
												{spot.memo}
											</p>
										)}
									</div>
									<div className="ml-2 flex flex-col items-end gap-1.5">
										{spot.isVisited && (
											<span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
												✓ 訪問済み
											</span>
										)}
										<button className="mt-1 text-[18px] text-blue-500">
											♥
										</button>
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>

			<Navigation />
		</div>
	);
}
