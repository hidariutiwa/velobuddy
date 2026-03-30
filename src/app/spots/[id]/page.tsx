"use client";

import Navigation from "@/components/layout/navigation";
import MapPlaceholder from "@/components/map/MapPlaceholder";
import Link from "next/link";
import { useState } from "react";

interface SpotDetail {
	id: string;
	name: string;
	category: string;
	area: string;
	address: string;
	rating: number;
	reviewCount: number;
	hours: string;
	description: string;
	memo: string;
	isFavorite: boolean;
	isVisited: boolean;
}

const mockSpotDetail: SpotDetail = {
	id: "1",
	name: "代々木公園",
	category: "公園",
	area: "東京都渋谷区",
	address: "東京都渋谷区代々木神園町2-1",
	rating: 4.5,
	reviewCount: 123,
	hours: "5:00 - 20:00（通年）",
	description:
		"代々木公園はサイクリングコースが整備されており、自転車での散策に最適です。広大な芝生広場や噴水広場もあり、休憩スポットも豊富です。",
	memo: "週末のサイクリングに最高！噴水前のベンチで休憩できる。",
	isFavorite: false,
	isVisited: false,
};

export default function SpotDetailPage() {
	const [isFavorite, setIsFavorite] = useState(mockSpotDetail.isFavorite);
	const [isVisited, setIsVisited] = useState(mockSpotDetail.isVisited);

	return (
		<div className="mx-auto flex h-screen max-w-[390px] flex-col bg-white">
			{/* Map preview with overlaid buttons */}
			<div className="relative flex-shrink-0">
				<MapPlaceholder className="h-64 w-full" showPin />
				{/* Status bar spacer */}
				<div className="absolute top-0 right-0 left-0 h-11" />
				{/* Back button */}
				<Link
					href="/spots"
					className="absolute top-13 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm"
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
				{/* Share button */}
				<button className="absolute top-13 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm">
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
						<path d="M8 2V10M5 5L8 2L11 5" />
						<path d="M4 8H3C2.45 8 2 8.45 2 9V13C2 13.55 2.45 14 3 14H13C13.55 14 14 13.55 14 13V9C14 8.45 13.55 8 13 8H12" />
					</svg>
				</button>
			</div>

			{/* Content card (scrollable) */}
			<div className="flex-1 overflow-y-auto pb-20">
				<div className="px-4 pt-4">
					{/* Category chip */}
					<span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
						{mockSpotDetail.category}
					</span>

					{/* Name */}
					<h1 className="mt-2 text-2xl font-bold text-zinc-900">
						{mockSpotDetail.name}
					</h1>

					{/* Rating */}
					<div className="mt-1 flex items-center gap-2">
						<span className="text-base font-bold text-blue-600">
							★ {mockSpotDetail.rating}
						</span>
						<span className="text-sm text-zinc-400">
							({mockSpotDetail.reviewCount}件のレビュー)
						</span>
					</div>

					<div className="mt-4 h-px bg-zinc-100" />

					{/* Info rows */}
					<div className="mt-4 space-y-4">
						<div className="flex gap-3">
							<div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-zinc-400">
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
								>
									<circle cx="8" cy="8" r="6" />
									<path d="M8 5V8L10 10" />
								</svg>
							</div>
							<div>
								<p className="text-[13px] font-medium text-zinc-500">
									営業時間
								</p>
								<p className="mt-0.5 text-sm text-zinc-900">
									{mockSpotDetail.hours}
								</p>
							</div>
						</div>

						<div className="flex gap-3">
							<div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-zinc-400">
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
								>
									<path
										d="M8 1C5.24 1 3 3.24 3 6C3 9.75 8 15 8 15C8 15 13 9.75 13 6C13 3.24 10.76 1 8 1ZM8 8C6.9 8 6 7.1 6 6C6 4.9 6.9 4 8 4C9.1 4 10 4.9 10 6C10 7.1 9.1 8 8 8Z"
										fill="currentColor"
										stroke="none"
									/>
								</svg>
							</div>
							<div>
								<p className="text-[13px] font-medium text-zinc-500">
									住所
								</p>
								<p className="mt-0.5 text-sm text-zinc-900">
									{mockSpotDetail.address}
								</p>
							</div>
						</div>

						<div className="flex gap-3">
							<div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-zinc-400">
								<svg
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									strokeLinecap="round"
								>
									<rect
										x="2"
										y="2"
										width="12"
										height="12"
										rx="2"
									/>
									<path d="M5 8H11M5 5H11M5 11H8" />
								</svg>
							</div>
							<div>
								<p className="text-[13px] font-medium text-zinc-500">
									カテゴリ
								</p>
								<p className="mt-0.5 text-sm text-zinc-900">
									公園・自然
								</p>
							</div>
						</div>
					</div>

					<div className="mt-4 h-px bg-zinc-100" />

					{/* Spot description */}
					<div className="mt-4">
						<h2 className="text-base font-bold text-zinc-900">
							スポット情報
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-zinc-600">
							{mockSpotDetail.description}
						</p>
					</div>

					{/* Memo */}
					<div className="mt-4 rounded-2xl bg-zinc-50 p-4">
						<p className="text-[13px] font-medium text-zinc-500">
							メモ
						</p>
						<p className="mt-1 text-sm text-zinc-700">
							{mockSpotDetail.memo}
						</p>
					</div>

					{/* Action buttons */}
					<div className="mt-6 flex gap-3 pb-4">
						<button
							onClick={() => setIsFavorite(!isFavorite)}
							className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-colors ${
								isFavorite
									? "bg-blue-500 text-white"
									: "bg-blue-50 text-blue-600"
							}`}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill={isFavorite ? "currentColor" : "none"}
								stroke="currentColor"
								strokeWidth="1.5"
							>
								<path d="M8 14C8 14 1 9.5 1 5.5C1 3.01 3.01 1 5.5 1C6.96 1 8.26 1.69 8 2.76C8.24 1.69 9.54 1 11 1C13.49 1 15.5 3.01 15.5 5.5C15.5 9.5 8 14 8 14Z" />
							</svg>
							{isFavorite ? "お気に入り済み" : "お気に入り追加"}
						</button>
						<button
							onClick={() => setIsVisited(!isVisited)}
							className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-colors ${
								isVisited
									? "bg-zinc-700 text-white"
									: "bg-zinc-100 text-zinc-700"
							}`}
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M3 8L6.5 11.5L13 5" />
							</svg>
							{isVisited ? "訪問済み" : "訪問済みにする"}
						</button>
					</div>
				</div>
			</div>

			<Navigation />
		</div>
	);
}
