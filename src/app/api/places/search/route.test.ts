import { GET } from "./route";
import { upsertPlace } from "@/lib/db/place";
import { PlaceCache } from "@/types/place";
import { NextRequest } from "next/server";

jest.mock("@/lib/db/place", () => ({
	upsertPlace: jest.fn(),
}));

jest.mock("@/lib/generated/prisma/client", () => ({
	PrismaClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("@prisma/adapter-pg", () => ({
	PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("dotenv/config", () => ({}));

const mockUpsertPlace = upsertPlace as jest.MockedFunction<typeof upsertPlace>;

const mockPlaceCache: PlaceCache = {
	id: 1,
	googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
	name: "代々木公園",
	latitude: 35.6715,
	longitude: 139.6944,
	address: "東京都渋谷区代々木神園町2-1",
	imageUrl: null,
};

const mockGoogleApiPlace = {
	id: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
	displayName: { text: "代々木公園", languageCode: "ja" },
	formattedAddress: "東京都渋谷区代々木神園町2-1",
	location: { latitude: 35.6715, longitude: 139.6944 },
	photos: null,
};

beforeEach(() => {
	jest.clearAllMocks();
	process.env.GOOGLE_PLACES_API_KEY = "test-key";
});

afterEach(() => {
	delete process.env.GOOGLE_PLACES_API_KEY;
});

describe("GET /api/places/search", () => {
	describe("バリデーション", () => {
		it("q パラメータが未指定の場合、400 を返すこと", async () => {
			const request = new Request(
				"http://localhost:3000/api/places/search",
			);
			const response = await GET(request as NextRequest);

			expect(response.status).toBe(400);
			const body = (await response.json()) as { error: string };
			expect(body.error).toBe("q is required");
		});

		it("q パラメータが空文字の場合、400 を返すこと", async () => {
			const request = new Request(
				"http://localhost:3000/api/places/search?q=",
			);
			const response = await GET(request as NextRequest);

			expect(response.status).toBe(400);
			const body = (await response.json()) as { error: string };
			expect(body.error).toBe("q is required");
		});
	});

	describe("正常系", () => {
		it("Google Places API が正常レスポンスを返す場合、PlaceCache[] を含む 200 を返すこと", async () => {
			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: true,
				json: async () => ({ places: [mockGoogleApiPlace] }),
			} as Response);

			mockUpsertPlace.mockResolvedValueOnce(mockPlaceCache);

			const request = new Request(
				"http://localhost:3000/api/places/search?q=カフェ",
			);
			const response = await GET(request as NextRequest);

			expect(response.status).toBe(200);
			const body = (await response.json()) as { places: PlaceCache[] };
			expect(Array.isArray(body.places)).toBe(true);
			expect(body.places).toHaveLength(1);
			expect(body.places[0].googlePlaceId).toBe(
				"ChIJp4JiUCNP0xQR1JaSjpW_Hms",
			);
		});

		it("places 配列が空の場合、空配列 [] を返すこと", async () => {
			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: true,
				json: async () => ({ places: [] }),
			} as Response);

			const request = new Request(
				"http://localhost:3000/api/places/search?q=存在しない場所",
			);
			const response = await GET(request as NextRequest);

			expect(response.status).toBe(200);
			const body = (await response.json()) as { places: PlaceCache[] };
			expect(Array.isArray(body.places)).toBe(true);
			expect(body.places).toHaveLength(0);
		});

		it("upsertPlace が各スポット数だけ呼ばれること", async () => {
			const anotherPlace = {
				id: "ChIJ_second",
				displayName: { text: "渋谷公園", languageCode: "ja" },
				formattedAddress: "東京都渋谷区",
				location: { latitude: 35.6581, longitude: 139.7017 },
				photos: null,
			};

			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					places: [mockGoogleApiPlace, anotherPlace],
				}),
			} as Response);

			const secondPlaceCache: PlaceCache = {
				id: 2,
				googlePlaceId: "ChIJ_second",
				name: "渋谷公園",
				latitude: 35.6581,
				longitude: 139.7017,
				address: "東京都渋谷区",
				imageUrl: null,
			};

			mockUpsertPlace
				.mockResolvedValueOnce(mockPlaceCache)
				.mockResolvedValueOnce(secondPlaceCache);

			const request = new Request(
				"http://localhost:3000/api/places/search?q=公園",
			);
			await GET(request as NextRequest);

			expect(mockUpsertPlace).toHaveBeenCalledTimes(2);
		});
	});

	describe("エラー系", () => {
		it("Google Places API 呼び出しが失敗した場合（fetch reject）、500 を返すこと", async () => {
			global.fetch = jest
				.fn()
				.mockRejectedValueOnce(new Error("Network error"));

			const request = new Request(
				"http://localhost:3000/api/places/search?q=カフェ",
			);
			const response = await GET(request as NextRequest);

			expect(response.status).toBe(500);
			const body = (await response.json()) as { error: string };
			expect(body.error).toBe("Internal server error");
		});

		it("Google Places API がエラーステータスを返した場合、500 を返すこと", async () => {
			global.fetch = jest.fn().mockResolvedValueOnce({
				ok: false,
				status: 403,
				json: async () => ({ error: "Forbidden" }),
			} as Response);

			const request = new Request(
				"http://localhost:3000/api/places/search?q=カフェ",
			);
			const response = await GET(request as NextRequest);

			expect(response.status).toBe(500);
			const body = (await response.json()) as { error: string };
			expect(body.error).toBe("Internal server error");
		});
	});
});
