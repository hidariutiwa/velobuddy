import {
	createFavorite,
	getFavoritesByUserId,
	upsertPlace,
} from "@/lib/db/place";
import { FavoritePlace } from "@/types/place";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

jest.mock("next-auth", () => ({
	getServerSession: jest.fn(),
}));

jest.mock("@/lib/db/place", () => ({
	upsertPlace: jest.fn(),
	createFavorite: jest.fn(),
	getFavoritesByUserId: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
	authOptions: {},
}));

// Dynamic import to ensure mocks are applied before module load
const getGetHandler = () => import("../route").then((m) => m.GET);
const getPostHandler = () => import("../route").then((m) => m.POST);

const mockGetServerSession = getServerSession as jest.MockedFunction<
	typeof getServerSession
>;
const mockGetFavoritesByUserId = getFavoritesByUserId as jest.MockedFunction<
	typeof getFavoritesByUserId
>;
const mockUpsertPlace = upsertPlace as jest.MockedFunction<typeof upsertPlace>;
const mockCreateFavorite = createFavorite as jest.MockedFunction<
	typeof createFavorite
>;

const mockFavoritePlace: FavoritePlace = {
	id: 10,
	place: {
		id: 1,
		googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
		name: "代々木公園",
		latitude: 35.6715,
		longitude: 139.6944,
		address: "東京都渋谷区代々木神園町2-1",
		imageUrl: null,
		priceLevel: null,
		openingHours: null,
		categories: [],
	},
	visited: false,
	memo: null,
	createdAt: "2026-04-01T00:00:00.000Z",
	updatedAt: "2026-04-01T00:00:00.000Z",
};

const mockSession = {
	user: { id: 1, email: "test@example.com", name: "Test User" },
	expires: "2026-12-31",
};

beforeEach(() => {
	jest.clearAllMocks();
});

describe("GET /api/favorites", () => {
	it("認証済みユーザーの FavoritePlace[] を 200 で返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetFavoritesByUserId.mockResolvedValueOnce([mockFavoritePlace]);

		const { GET } = await import("../route");
		const request = new NextRequest(
			new Request("http://localhost:3000/api/favorites", {
				method: "GET",
			}),
		);
		const response = await GET(request);

		expect(response).toBeInstanceOf(NextResponse);
		const body = (await response.json()) as FavoritePlace[];
		expect(response.status).toBe(200);
		expect(Array.isArray(body)).toBe(true);
		expect(body).toHaveLength(1);
		expect(body[0].id).toBe(10);
		expect(mockGetFavoritesByUserId).toHaveBeenCalledWith(1, undefined);
	});

	it("未認証の場合 401 を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(null);

		const { GET } = await import("../route");
		const request = new NextRequest(
			new Request("http://localhost:3000/api/favorites", {
				method: "GET",
			}),
		);
		const response = await GET(request);

		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});
});

describe("POST /api/favorites", () => {
	it("有効なリクエストで FavoritePlace を 201 で返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockUpsertPlace.mockResolvedValueOnce({
			id: 1,
			googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
			name: "代々木公園",
			latitude: 35.6715,
			longitude: 139.6944,
			address: "東京都渋谷区代々木神園町2-1",
			imageUrl: null,
			priceLevel: null,
			openingHours: null,
			categories: [],
		});
		mockCreateFavorite.mockResolvedValueOnce(mockFavoritePlace);

		const request = new Request("http://localhost/api/favorites", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
				name: "代々木公園",
				latitude: 35.6715,
				longitude: 139.6944,
				address: "東京都渋谷区代々木神園町2-1",
				imageUrl: null,
			}),
		});

		const { POST } = await import("../route");
		const response = await POST(request);

		expect(response.status).toBe(201);
		const body = (await response.json()) as FavoritePlace;
		expect(body.id).toBe(10);
		expect(body.place.googlePlaceId).toBe("ChIJp4JiUCNP0xQR1JaSjpW_Hms");
	});

	it("未認証の場合 401 を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(null);

		const request = new Request("http://localhost/api/favorites", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
				name: "代々木公園",
				latitude: null,
				longitude: null,
				address: null,
				imageUrl: null,
			}),
		});

		const { POST } = await import("../route");
		const response = await POST(request);

		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});

	it("googlePlaceId が欠けている場合 400 を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);

		const request = new Request("http://localhost/api/favorites", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "代々木公園",
				latitude: null,
				longitude: null,
				address: null,
				imageUrl: null,
			}),
		});

		const { POST } = await import("../route");
		const response = await POST(request);

		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});

	it("name が欠けている場合 400 を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);

		const request = new Request("http://localhost/api/favorites", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
				latitude: null,
				longitude: null,
				address: null,
				imageUrl: null,
			}),
		});

		const { POST } = await import("../route");
		const response = await POST(request);

		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});
});

// Suppress unused import warnings for dynamic import helpers
void getGetHandler;
void getPostHandler;
