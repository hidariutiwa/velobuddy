import {
	deleteActivity,
	getActivityById,
	getActivityOwner,
	updateActivity,
} from "@/lib/db/activity";
import { ActivityResponse } from "@/types/activity";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

jest.mock("next-auth", () => ({
	getServerSession: jest.fn(),
}));

jest.mock("@/lib/db/activity", () => ({
	getActivityById: jest.fn(),
	getActivityOwner: jest.fn(),
	updateActivity: jest.fn(),
	deleteActivity: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
	authOptions: {},
}));

const mockGetServerSession = getServerSession as jest.MockedFunction<
	typeof getServerSession
>;
const mockGetActivityById = getActivityById as jest.MockedFunction<
	typeof getActivityById
>;
const mockGetActivityOwner = getActivityOwner as jest.MockedFunction<
	typeof getActivityOwner
>;
const mockUpdateActivity = updateActivity as jest.MockedFunction<
	typeof updateActivity
>;
const mockDeleteActivity = deleteActivity as jest.MockedFunction<
	typeof deleteActivity
>;

const mockActivityResponse: ActivityResponse = {
	id: 1,
	activityAt: "2026-03-01T00:00:00.000Z",
	distance: 10.54,
	averageVelocity: 20.01,
	maxVelocity: 30.9,
	elevation: 23.98,
	burnCalories: 384,
	drivingTime: 1823,
	polyline: null,
	createdAt: "2026-03-01T00:00:00.000Z",
	updatedAt: "2026-03-01T00:00:00.000Z",
};

const mockSession = {
	user: { id: 1, email: "test@example.com", name: "Test User" },
	expires: "2026-12-31",
};

beforeEach(() => {
	jest.clearAllMocks();
});

describe("GET /api/activities/[id]", () => {
	it("認証済みで存在するActivityを200で返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetActivityById.mockResolvedValueOnce(mockActivityResponse);

		const request = new Request("http://localhost/api/activities/1", {
			method: "GET",
		});
		const params = Promise.resolve({ id: "1" });

		const { GET } = await import("../route");
		const response = await GET(request, { params });

		expect(response).toBeInstanceOf(NextResponse);
		expect(response.status).toBe(200);
		const body = (await response.json()) as ActivityResponse;
		expect(body.id).toBe(1);
		expect(mockGetActivityById).toHaveBeenCalledWith(1);
	});

	it("未認証の場合401を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(null);

		const request = new Request("http://localhost/api/activities/1", {
			method: "GET",
		});
		const params = Promise.resolve({ id: "1" });

		const { GET } = await import("../route");
		const response = await GET(request, { params });

		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});

	it("存在しないIDで404を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetActivityById.mockResolvedValueOnce(null);

		const request = new Request("http://localhost/api/activities/999", {
			method: "GET",
		});
		const params = Promise.resolve({ id: "999" });

		const { GET } = await import("../route");
		const response = await GET(request, { params });

		expect(response.status).toBe(404);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});
});

describe("PATCH /api/activities/[id]", () => {
	it("有効なリクエストで更新されたActivityを200で返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetActivityOwner.mockResolvedValueOnce({
			id: 1,
			userId: 1,
		});
		mockUpdateActivity.mockResolvedValueOnce({
			...mockActivityResponse,
			distance: 15.0,
		});

		const request = new Request("http://localhost/api/activities/1", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ distance: 15.0 }),
		});
		const params = Promise.resolve({ id: "1" });

		const { PATCH } = await import("../route");
		const response = await PATCH(request, { params });

		expect(response).toBeInstanceOf(NextResponse);
		expect(response.status).toBe(200);
		const body = (await response.json()) as ActivityResponse;
		expect(body.distance).toBe(15.0);
		expect(body.id).toBe(1);
	});

	it("未認証の場合401を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(null);

		const request = new Request("http://localhost/api/activities/1", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ distance: 15.0 }),
		});
		const params = Promise.resolve({ id: "1" });

		const { PATCH } = await import("../route");
		const response = await PATCH(request, { params });

		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});

	it("他ユーザーのActivityは403を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetActivityOwner.mockResolvedValueOnce({
			id: 1,
			userId: 999,
		});

		const request = new Request("http://localhost/api/activities/1", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ distance: 15.0 }),
		});
		const params = Promise.resolve({ id: "1" });

		const { PATCH } = await import("../route");
		const response = await PATCH(request, { params });

		expect(response.status).toBe(403);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});
});

describe("DELETE /api/activities/[id]", () => {
	it("認証済みで204を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetActivityOwner.mockResolvedValueOnce({
			id: 1,
			userId: 1,
		});
		mockDeleteActivity.mockResolvedValueOnce(undefined);

		const request = new Request("http://localhost/api/activities/1", {
			method: "DELETE",
		});
		const params = Promise.resolve({ id: "1" });

		const { DELETE } = await import("../route");
		const response = await DELETE(request, { params });

		expect(response.status).toBe(204);
	});

	it("未認証の場合401を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(null);

		const request = new Request("http://localhost/api/activities/1", {
			method: "DELETE",
		});
		const params = Promise.resolve({ id: "1" });

		const { DELETE } = await import("../route");
		const response = await DELETE(request, { params });

		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});

	it("他ユーザーのActivityは403を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetActivityOwner.mockResolvedValueOnce({
			id: 1,
			userId: 999,
		});

		const request = new Request("http://localhost/api/activities/1", {
			method: "DELETE",
		});
		const params = Promise.resolve({ id: "1" });

		const { DELETE } = await import("../route");
		const response = await DELETE(request, { params });

		expect(response.status).toBe(403);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});
});
