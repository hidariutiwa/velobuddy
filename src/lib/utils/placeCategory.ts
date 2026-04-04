import { PlaceCategory } from "@/types/place";

const GOOGLE_TYPE_TO_CATEGORY: Record<string, PlaceCategory> = {
	park: "公園",
	hot_spring: "温泉",
	spa: "温泉",
	public_bath: "銭湯",
	restaurant: "食事",
	meal_delivery: "食事",
	meal_takeaway: "食事",
	cafe: "カフェ",
};

export function mapGoogleTypesToCategory(types: string[]): PlaceCategory {
	for (const type of types) {
		const category = GOOGLE_TYPE_TO_CATEGORY[type];
		if (category !== undefined) {
			return category;
		}
	}
	return "観光";
}
