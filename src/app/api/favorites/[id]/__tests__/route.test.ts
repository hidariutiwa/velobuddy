import {
	deleteFavorite,
	getFavoriteById,
	updateFavorite,
} from "@/lib/db/place";
import { FavoritePlace } from "@/types/place";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

jest.mock("next-auth", () => ({
	getServerSession: jest.fn(),
}));

jest.mock("@/lib/db/place", () => ({
	updateFavorite: jest.fn(),
	deleteFavorite: jest.fn(),
	getFavoriteById: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
	authOptions: {},
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<
	typeof getServerSession
>;
const mockUpdateFavorite = updateFavorite as jest.MockedFunction<
	typeof updateFavorite
>;
const mockDeleteFavorite = deleteFavorite as jest.MockedFunction<
	typeof deleteFavorite
>;
const mockGetFavoriteById = getFavoriteById as jest.MockedFunction<
	typeof getFavoriteById
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
	},
	visited: true,
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

describe("PATCH /api/favorites/[id]", () => {
	it("visited を更新した FavoritePlace を 200 で返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetFavoriteById.mockResolvedValueOnce({
			id: 10,
			userId: 1,
		} as Awaited<ReturnType<typeof getFavoriteById>>);
		mockUpdateFavorite.mockResolvedValueOnce({
			...mockFavoritePlace,
			visited: true,
		});

		const request = new Request("http://localhost/api/favorites/10", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ visited: true }),
		});
		const params = Promise.resolve({ id: "10" });

		const { PATCH } = await import("../route");
		const response = await PATCH(request, { params });

		expect(response).toBeInstanceOf(NextResponse);
		expect(response.status).toBe(200);
		const body = (await response.json()) as FavoritePlace;
		expect(body.visited).toBe(true);
		expect(body.id).toBe(10);
	});

	it("memo を null に更新できる", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetFavoriteById.mockResolvedValueOnce({
			id: 10,
			userId: 1,
		} as Awaited<ReturnType<typeof getFavoriteById>>);
		mockUpdateFavorite.mockResolvedValueOnce({
			...mockFavoritePlace,
			memo: null,
		});

		const request = new Request("http://localhost/api/favorites/10", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ memo: null }),
		});
		const params = Promise.resolve({ id: "10" });

		const { PATCH } = await import("../route");
		const response = await PATCH(request, { params });

		expect(response.status).toBe(200);
		const body = (await response.json()) as FavoritePlace;
		expect(body.memo).toBeNull();
	});

	it("未認証の場合 401 を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(null);

		const request = new Request("http://localhost/api/favorites/10", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ visited: true }),
		});
		const params = Promise.resolve({ id: "10" });

		const { PATCH } = await import("../route");
		const response = await PATCH(request, { params });

		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});

	it("id が数値でない場合 400 を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);

		const request = new Request("http://localhost/api/favorites/abc", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ visited: true }),
		});
		const params = Promise.resolve({ id: "abc" });

		const { PATCH } = await import("../route");
		const response = await PATCH(request, { params });

		expect(response.status).toBe(400);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});
});

describe("DELETE /api/favorites/[id]", () => {
	it("削除成功時 204 を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetFavoriteById.mockResolvedValueOnce({
			id: 10,
			userId: 1,
		} as Awaited<ReturnType<typeof getFavoriteById>>);
		mockDeleteFavorite.mockResolvedValueOnce(undefined);

		const request = new Request("http://localhost/api/favorites/10", {
			method: "DELETE",
		});
		const params = Promise.resolve({ id: "10" });

		const { DELETE } = await import("../route");
		const response = await DELETE(request, { params });

		expect(response.status).toBe(204);
	});

	it("未認証の場合 401 を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(null);

		const request = new Request("http://localhost/api/favorites/10", {
			method: "DELETE",
		});
		const params = Promise.resolve({ id: "10" });

		const { DELETE } = await import("../route");
		const response = await DELETE(request, { params });

		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});

	it("deleteFavorite が (id, userId) の両方を引数で呼ばれる", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetFavoriteById.mockResolvedValueOnce({
			id: 10,
			userId: 1,
		} as Awaited<ReturnType<typeof getFavoriteById>>);
		mockDeleteFavorite.mockResolvedValueOnce(undefined);

		const request = new Request("http://localhost/api/favorites/10", {
			method: "DELETE",
		});
		const params = Promise.resolve({ id: "10" });

		const { DELETE } = await import("../route");
		await DELETE(request, { params });

		expect(mockDeleteFavorite).toHaveBeenCalledTimes(1);
		expect(mockDeleteFavorite).toHaveBeenCalledWith(10, 1);
	});
});
