"use client";

import Navigation from "@/components/layout/navigation";
import MapPlaceholder from "@/components/map/MapPlaceholder";
import { useState } from "react";

const categories = ["すべて", "カフェ", "公園", "食事", "観光"] as const;
type Category = (typeof categories)[number];

export default function Home() {
	const [activeCategory, setActiveCategory] = useState<Category>("すべて");

	return (
		<div className="relative mx-auto h-screen max-w-[390px] overflow-hidden">
			{/* Map background (full screen) */}
			<MapPlaceholder
				className="absolute inset-0 h-full w-full"
				showPin
			/>

			{/* Status bar spacer */}
			<div className="absolute top-0 right-0 left-0 h-11" />

			{/* Search bar + GPS button */}
			<div className="absolute top-14 right-0 left-0 flex items-center gap-2 px-4">
				<div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-3 shadow-md">
					<div className="h-5 w-5 flex-shrink-0 rounded-full bg-zinc-200" />
					<span className="text-sm text-zinc-400">
						スポットを検索...
					</span>
				</div>
				<button className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white text-blue-500 shadow-md">
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
			<div className="absolute top-[116px] right-0 left-0 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
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

			{/* Bottom sheet */}
			<div className="rounded-t-5xl absolute right-0 bottom-20 left-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.12)]">
				<div className="mx-auto mt-3 mb-3 h-1 w-12 rounded-full bg-zinc-300" />
				<div className="flex items-start gap-3 px-4 pb-4">
					<div className="h-16 w-16 flex-shrink-0 rounded-xl bg-zinc-200" />
					<div className="min-w-0 flex-1">
						<p className="text-base font-bold text-zinc-900">
							代々木公園
						</p>
						<p className="mt-0.5 text-xs text-zinc-500">
							公園 · 東京都渋谷区
						</p>
						<p className="mt-0.5 text-xs font-bold text-blue-600">
							★ 4.5　(123件)
						</p>
						<p className="mt-0.5 text-[11px] text-zinc-400">
							サイクリングコース有り
						</p>
					</div>
					<button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
						<svg
							width="18"
							height="18"
							viewBox="0 0 18 18"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<path d="M9 15C9 15 1.5 10.5 1.5 6.5C1.5 4.01 3.51 2 6 2C7.46 2 8.76 2.69 9 3.76C9.24 2.69 10.54 2 12 2C14.49 2 16.5 4.01 16.5 6.5C16.5 10.5 9 15 9 15Z" />
						</svg>
					</button>
				</div>
			</div>

			<Navigation />
		</div>
	);
}
