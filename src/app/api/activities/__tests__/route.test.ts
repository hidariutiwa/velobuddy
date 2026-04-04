import { createActivity, getActivitiesByUserId } from "@/lib/db/activity";
import { ActivityResponse } from "@/types/activity";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

jest.mock("next-auth", () => ({
	getServerSession: jest.fn(),
}));

jest.mock("@/lib/db/activity", () => ({
	createActivity: jest.fn(),
	getActivitiesByUserId: jest.fn(),
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
const mockGetActivitiesByUserId = getActivitiesByUserId as jest.MockedFunction<
	typeof getActivitiesByUserId
>;
const mockCreateActivity = createActivity as jest.MockedFunction<
	typeof createActivity
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

describe("GET /api/activities", () => {
	it("認証済みユーザーの ActivityResponse[] を 200 で返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockGetActivitiesByUserId.mockResolvedValueOnce([mockActivityResponse]);

		const { GET } = await import("../route");
		const response = await GET();

		expect(response).toBeInstanceOf(NextResponse);
		const body = (await response.json()) as ActivityResponse[];
		expect(response.status).toBe(200);
		expect(Array.isArray(body)).toBe(true);
		expect(body).toHaveLength(1);
		expect(body[0].id).toBe(1);
		expect(mockGetActivitiesByUserId).toHaveBeenCalledWith(1);
	});

	it("未認証の場合 401 を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(null);

		const { GET } = await import("../route");
		const response = await GET();

		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});
});

describe("POST /api/activities", () => {
	it("有効なリクエストで ActivityResponse を 201 で返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);
		mockCreateActivity.mockResolvedValueOnce(mockActivityResponse);

		const request = new Request("http://localhost/api/activities", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				distance: 10.54,
				averageVelocity: 20.01,
				maxVelocity: 30.9,
				elevation: 23.98,
				burnCalories: 384,
				drivingTime: 1823,
			}),
		});

		const { POST } = await import("../route");
		const response = await POST(request);

		expect(response.status).toBe(201);
		const body = (await response.json()) as ActivityResponse;
		expect(body.id).toBe(1);
		expect(body.distance).toBe(10.54);
	});

	it("未認証の場合 401 を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(null);

		const request = new Request("http://localhost/api/activities", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				distance: 10.54,
				averageVelocity: 20.01,
				maxVelocity: 30.9,
				elevation: 23.98,
				burnCalories: 384,
				drivingTime: 1823,
			}),
		});

		const { POST } = await import("../route");
		const response = await POST(request);

		expect(response.status).toBe(401);
		const body = (await response.json()) as { error: string };
		expect(body.error).toBeDefined();
	});

	it("distance が欠けている場合 400 を返す", async () => {
		mockGetServerSession.mockResolvedValueOnce(
			mockSession as Parameters<
				typeof mockGetServerSession
			>[0] extends undefined
				? never
				: Awaited<ReturnType<typeof mockGetServerSession>>,
		);

		const request = new Request("http://localhost/api/activities", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				averageVelocity: 20.01,
				maxVelocity: 30.9,
				elevation: 23.98,
				burnCalories: 384,
				drivingTime: 1823,
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
