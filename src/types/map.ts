export interface Place {
	id: number;
	name: string;
	category: "公園" | "温泉" | "銭湯" | "食事" | "カフェ" | "観光";
	reviewScore: number;
	note?: string;
	prefectures: string;
	cityName: string;
}

export const mockPlaces: Place[] = [
	{
		id: 1,
		name: "代々木公園",
		category: "公園",
		prefectures: "東京都",
		cityName: "渋谷区",
		reviewScore: 4.5,
	},
	{
		id: 2,
		name: "ブルーボトルコーヒー",
		category: "カフェ",
		prefectures: "東京都",
		cityName: "渋谷区",
		reviewScore: 3.5,
	},
	{
		id: 3,
		name: "明治神宮",
		category: "観光",
		prefectures: "東京都",
		cityName: "渋谷区",
		reviewScore: 4.0,
	},
	{
		id: 4,
		name: "表参道グルメ通り",
		category: "食事",
		prefectures: "東京都",
		cityName: "港区",
		reviewScore: 4.1,
	},
];
