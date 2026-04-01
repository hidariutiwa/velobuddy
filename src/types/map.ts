import { PlaceCache } from "./place";

export interface MapPlace extends PlaceCache {
  category: "公園" | "温泉" | "銭湯" | "食事" | "カフェ" | "観光";
}

export const mockPlaces: MapPlace[] = [
  { id: 1, googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms", name: "代々木公園", category: "公園", latitude: 35.6715, longitude: 139.6944, address: "東京都渋谷区代々木神園町2-1", imageUrl: null },
  { id: 2, googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4", name: "ブルーボトルコーヒー", category: "カフェ", latitude: 35.6625, longitude: 139.7034, address: "東京都渋谷区", imageUrl: null },
  { id: 3, googlePlaceId: "ChIJWRxMpWuMGGARQhFqgJDqpyE", name: "明治神宮", category: "観光", latitude: 35.6763, longitude: 139.6993, address: "東京都渋谷区代々木神園町1-1", imageUrl: null },
  { id: 4, googlePlaceId: "ChIJgUbEo8cfqokR5lP9_Wh_DaM", name: "表参道グルメ通り", category: "食事", latitude: 35.6653, longitude: 139.7121, address: "東京都港区", imageUrl: null },
];
