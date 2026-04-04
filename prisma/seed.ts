import { PrismaClient } from "../src/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const categories = ["公園", "温泉", "銭湯", "食事", "カフェ", "観光"];

const places = [
	{
		googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
		name: "代々木公園",
		latitude: 35.6715,
		longitude: 139.6944,
		address: "東京都渋谷区代々木神園町2-1",
		categories: ["公園"],
	},
	{
		googlePlaceId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
		name: "ブルーボトルコーヒー 青山カフェ",
		latitude: 35.6625,
		longitude: 139.7034,
		address: "東京都渋谷区",
		priceLevel: "PRICE_LEVEL_MODERATE",
		categories: ["カフェ"],
	},
	{
		googlePlaceId: "ChIJWRxMpWuMGGARQhFqgJDqpyE",
		name: "明治神宮",
		latitude: 35.6763,
		longitude: 139.6993,
		address: "東京都渋谷区代々木神園町1-1",
		categories: ["観光"],
	},
	{
		googlePlaceId: "ChIJgUbEo8cfqokR5lP9_Wh_DaM",
		name: "表参道グルメ通り",
		latitude: 35.6653,
		longitude: 139.7121,
		address: "東京都港区",
		priceLevel: "PRICE_LEVEL_MODERATE",
		categories: ["食事"],
	},
	{
		googlePlaceId: "ChIJ3ygLZBeMGGAR1kFf3r6bMXE",
		name: "大江戸温泉物語",
		latitude: 35.6262,
		longitude: 139.7745,
		address: "東京都江東区青海2-6-3",
		priceLevel: "PRICE_LEVEL_MODERATE",
		categories: ["温泉"],
	},
	{
		googlePlaceId: "ChIJx6RoFzqMGGAR8_pnRqk2B00",
		name: "改良湯",
		latitude: 35.6504,
		longitude: 139.7099,
		address: "東京都渋谷区東2-19-9",
		priceLevel: "PRICE_LEVEL_INEXPENSIVE",
		categories: ["銭湯"],
	},
];

async function main() {
	console.log("Seeding database...");

	// Upsert categories
	const categoryRecords: Record<string, { id: number }> = {};
	for (const name of categories) {
		const record = await prisma.placeCategory.upsert({
			where: { name },
			update: {},
			create: { name },
		});
		categoryRecords[name] = record;
	}
	console.log(`  ${categories.length} categories upserted`);

	// Upsert places
	for (const place of places) {
		await prisma.place.upsert({
			where: { googlePlaceId: place.googlePlaceId },
			update: {
				name: place.name,
				latitude: place.latitude,
				longitude: place.longitude,
				address: place.address,
				priceLevel: place.priceLevel ?? null,
				categories: {
					set: place.categories.map((c) => ({
						id: categoryRecords[c].id,
					})),
				},
			},
			create: {
				googlePlaceId: place.googlePlaceId,
				name: place.name,
				latitude: place.latitude,
				longitude: place.longitude,
				address: place.address,
				priceLevel: place.priceLevel ?? null,
				categories: {
					connect: place.categories.map((c) => ({
						id: categoryRecords[c].id,
					})),
				},
			},
		});
	}
	console.log(`  ${places.length} places upserted`);

	console.log("Seed completed.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
