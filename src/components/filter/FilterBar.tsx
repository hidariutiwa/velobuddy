"use client";

import { FilterOptions, PlaceCategory } from "@/types/place";

const CATEGORIES: PlaceCategory[] = [
	"カフェ",
	"公園",
	"食事",
	"観光",
	"温泉",
	"銭湯",
];

const PRICE_LEVELS = [
	{ label: "¥", value: "PRICE_LEVEL_INEXPENSIVE" },
	{ label: "¥¥", value: "PRICE_LEVEL_MODERATE" },
	{ label: "¥¥¥", value: "PRICE_LEVEL_EXPENSIVE" },
	{ label: "¥¥¥¥", value: "PRICE_LEVEL_VERY_EXPENSIVE" },
];

interface FilterBarProps {
	filter: FilterOptions;
	onChange: (filter: FilterOptions) => void;
	showFavoriteFilter?: boolean;
}

export function FilterBar({
	filter,
	onChange,
	showFavoriteFilter,
}: FilterBarProps) {
	const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		onChange({
			...filter,
			category: value === "" ? undefined : (value as PlaceCategory),
		});
	};

	const handlePriceLevelChange = (
		e: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const value = e.target.value;
		onChange({ ...filter, priceLevel: value === "" ? undefined : value });
	};

	const toggleChip = (key: keyof FilterOptions) => {
		if (key === "visited") {
			onChange({
				...filter,
				visited: filter.visited === true ? undefined : true,
			});
		} else if (key === "openNow") {
			onChange({ ...filter, openNow: !filter.openNow });
		} else if (key === "isFavorite") {
			onChange({ ...filter, isFavorite: !filter.isFavorite });
		}
	};

	const handleUnvisited = () => {
		onChange({
			...filter,
			visited: filter.visited === false ? undefined : false,
		});
	};

	const chipClass = (active: boolean) =>
		active
			? "rounded-full bg-blue-600 text-white px-3.5 py-1.5 text-sm font-semibold"
			: "rounded-full bg-white border border-zinc-200 text-zinc-700 px-3.5 py-1.5 text-sm font-semibold";

	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex gap-2">
				<select
					value={filter.category ?? ""}
					onChange={handleCategoryChange}
					className="rounded-[10px] border border-zinc-200 bg-white px-3 py-2 text-sm"
				>
					<option value="">すべてのカテゴリ</option>
					{CATEGORIES.map((cat) => (
						<option key={cat} value={cat}>
							{cat}
						</option>
					))}
				</select>
				<select
					value={filter.priceLevel ?? ""}
					onChange={handlePriceLevelChange}
					className="rounded-[10px] border border-zinc-200 bg-white px-3 py-2 text-sm"
				>
					<option value="">すべての価格</option>
					{PRICE_LEVELS.map((p) => (
						<option key={p.value} value={p.value}>
							{p.label}
						</option>
					))}
				</select>
			</div>
			<div className="flex flex-wrap gap-2">
				{showFavoriteFilter && (
					<button
						type="button"
						className={chipClass(!!filter.isFavorite)}
						onClick={() => toggleChip("isFavorite")}
					>
						お気に入り
					</button>
				)}
				<button
					type="button"
					className={chipClass(filter.visited === true)}
					onClick={() => toggleChip("visited")}
				>
					訪問済み
				</button>
				<button
					type="button"
					className={chipClass(filter.visited === false)}
					onClick={handleUnvisited}
				>
					未訪問
				</button>
				<button
					type="button"
					className={chipClass(!!filter.openNow)}
					onClick={() => toggleChip("openNow")}
				>
					営業中
				</button>
			</div>
		</div>
	);
}
