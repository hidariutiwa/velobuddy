import {
	createFavorite,
	deleteFavorite,
	getFavoritesByUserId,
	updateFavorite,
	upsertPlace,
} from "@/lib/db/place";
import {
	AddFavoriteRequest,
	FavoritePlace,
	PlaceCache,
	UpdateFavoriteRequest,
} from "@/types/place";

jest.mock("@/lib/generated/prisma/client", () => ({
	PrismaClient: jest.fn().mockImplementation(() => ({
		place: {
			upsert: jest.fn(),
		},
		userFavoritePlace: {
			create: jest.fn(),
			findMany: jest.fn(),
			update: jest.fn(),
			deleteMany: jest.fn(),
		},
	})),
}));

jest.mock("@prisma/adapter-pg", () => ({
	PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("dotenv/config", () => ({}));

// Get the prisma instance that place.ts created at module load time
const MockedPrismaClient: jest.Mock = jest.requireMock(
	"@/lib/generated/prisma/client",
).PrismaClient;

const prismaInstance = MockedPrismaClient.mock.results[0]?.value as {
	place: { upsert: jest.Mock };
	userFavoritePlace: {
		create: jest.Mock;
		findMany: jest.Mock;
		update: jest.Mock;
		deleteMany: jest.Mock;
	};
};

const mockPrismaPlace = prismaInstance.place;
const mockPrismaUserFavoritePlace = prismaInstance.userFavoritePlace;

const mockPlace: PlaceCache = {
	id: 1,
	googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
	name: "代々木公園",
	latitude: 35.6715,
	longitude: 139.6944,
	address: "東京都渋谷区代々木神園町2-1",
	imageUrl: null,
};

const mockFavorite: FavoritePlace = {
	id: 10,
	place: mockPlace,
	visited: false,
	memo: null,
	createdAt: "2026-04-01T00:00:00.000Z",
	updatedAt: "2026-04-01T00:00:00.000Z",
};

const addRequest: AddFavoriteRequest = {
	googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
	name: "代々木公園",
	latitude: 35.6715,
	longitude: 139.6944,
	address: "東京都渋谷区代々木神園町2-1",
	imageUrl: null,
};

beforeEach(() => {
	jest.clearAllMocks();
});

describe("upsertPlace", () => {
	it("googlePlaceId で Place を upsert し PlaceCache を返す", async () => {
		mockPrismaPlace.upsert.mockResolvedValueOnce({
			id: 1,
			googlePlaceId: addRequest.googlePlaceId,
			name: addRequest.name,
			latitude: addRequest.latitude,
			longitude: addRequest.longitude,
			address: addRequest.address,
			imageUrl: addRequest.imageUrl,
		});

		const result = await upsertPlace(addRequest);

		expect(mockPrismaPlace.upsert).toHaveBeenCalledTimes(1);
		expect(result.googlePlaceId).toBe(addRequest.googlePlaceId);
		expect(result.name).toBe(addRequest.name);
	});

	it("全フィールドが正しくPrismaに渡される", async () => {
		mockPrismaPlace.upsert.mockResolvedValueOnce({
			id: 1,
			googlePlaceId: addRequest.googlePlaceId,
			name: addRequest.name,
			latitude: addRequest.latitude,
			longitude: addRequest.longitude,
			address: addRequest.address,
			imageUrl: addRequest.imageUrl,
		});

		await upsertPlace(addRequest);

		const callArg = mockPrismaPlace.upsert.mock.calls[0][0] as {
			where: { googlePlaceId: string };
			create: AddFavoriteRequest;
			update: Omit<AddFavoriteRequest, "googlePlaceId">;
		};
		expect(callArg.where.googlePlaceId).toBe(addRequest.googlePlaceId);
		expect(callArg.create.name).toBe(addRequest.name);
		expect(callArg.create.latitude).toBe(addRequest.latitude);
		expect(callArg.create.longitude).toBe(addRequest.longitude);
		expect(callArg.create.address).toBe(addRequest.address);
		expect(callArg.create.imageUrl).toBe(addRequest.imageUrl);
	});
});

describe("createFavorite", () => {
	it("userId と placeId で UserFavoritePlace を作成し FavoritePlace を返す", async () => {
		mockPrismaUserFavoritePlace.create.mockResolvedValueOnce({
			id: 10,
			userId: 1,
			placeId: 1,
			visited: false,
			memo: null,
			createdAt: new Date("2026-04-01T00:00:00.000Z"),
			updatedAt: new Date("2026-04-01T00:00:00.000Z"),
			place: {
				id: 1,
				googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
				name: "代々木公園",
				latitude: 35.6715,
				longitude: 139.6944,
				address: "東京都渋谷区代々木神園町2-1",
				imageUrl: null,
			},
		});

		const result = await createFavorite(1, 1);

		expect(mockPrismaUserFavoritePlace.create).toHaveBeenCalledTimes(1);
		expect(result.id).toBe(10);
		expect(result.place.googlePlaceId).toBe("ChIJp4JiUCNP0xQR1JaSjpW_Hms");
		expect(result.visited).toBe(false);
	});

	it("createdAt と updatedAt が ISO 文字列である", async () => {
		mockPrismaUserFavoritePlace.create.mockResolvedValueOnce({
			id: 10,
			userId: 1,
			placeId: 1,
			visited: false,
			memo: null,
			createdAt: new Date("2026-04-01T00:00:00.000Z"),
			updatedAt: new Date("2026-04-01T00:00:00.000Z"),
			place: {
				id: 1,
				googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
				name: "代々木公園",
				latitude: 35.6715,
				longitude: 139.6944,
				address: "東京都渋谷区代々木神園町2-1",
				imageUrl: null,
			},
		});

		const result = await createFavorite(1, 1);

		expect(typeof result.createdAt).toBe("string");
		expect(typeof result.updatedAt).toBe("string");
		// ISO 8601 format check
		expect(new Date(result.createdAt).toISOString()).toBe(result.createdAt);
		expect(new Date(result.updatedAt).toISOString()).toBe(result.updatedAt);
	});
});

describe("getFavoritesByUserId", () => {
	it("userId に紐づく FavoritePlace[] を返す", async () => {
		mockPrismaUserFavoritePlace.findMany.mockResolvedValueOnce([
			{
				id: 10,
				userId: 1,
				placeId: 1,
				visited: false,
				memo: null,
				createdAt: new Date("2026-04-01T00:00:00.000Z"),
				updatedAt: new Date("2026-04-01T00:00:00.000Z"),
				place: {
					id: 1,
					googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
					name: "代々木公園",
					latitude: 35.6715,
					longitude: 139.6944,
					address: "東京都渋谷区代々木神園町2-1",
					imageUrl: null,
				},
			},
		]);

		const result = await getFavoritesByUserId(1);

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBe(10);
		expect(result[0].place.name).toBe("代々木公園");
	});

	it("お気に入りが 0 件の場合は空配列を返す", async () => {
		mockPrismaUserFavoritePlace.findMany.mockResolvedValueOnce([]);

		const result = await getFavoritesByUserId(1);

		expect(result).toEqual([]);
	});

	it("orderBy: { createdAt: 'desc' } で Prisma を呼ぶ", async () => {
		mockPrismaUserFavoritePlace.findMany.mockResolvedValueOnce([]);

		await getFavoritesByUserId(1);

		const callArg = mockPrismaUserFavoritePlace.findMany.mock
			.calls[0][0] as {
			where: { userId: number };
			orderBy: { createdAt: string };
		};
		expect(callArg.orderBy).toEqual({ createdAt: "desc" });
	});
});

describe("updateFavorite", () => {
	it("visited を更新した FavoritePlace を返す", async () => {
		const updateData: UpdateFavoriteRequest = { visited: true };
		mockPrismaUserFavoritePlace.update.mockResolvedValueOnce({
			id: 10,
			userId: 1,
			placeId: 1,
			visited: true,
			memo: null,
			createdAt: new Date("2026-04-01T00:00:00.000Z"),
			updatedAt: new Date("2026-04-01T00:00:00.000Z"),
			place: {
				id: 1,
				googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
				name: "代々木公園",
				latitude: 35.6715,
				longitude: 139.6944,
				address: "東京都渋谷区代々木神園町2-1",
				imageUrl: null,
			},
		});

		const result = await updateFavorite(10, updateData);

		expect(result.visited).toBe(true);
		expect(result.id).toBe(10);
	});

	it("memo を null に更新できる", async () => {
		const updateData: UpdateFavoriteRequest = { memo: null };
		mockPrismaUserFavoritePlace.update.mockResolvedValueOnce({
			id: 10,
			userId: 1,
			placeId: 1,
			visited: false,
			memo: null,
			createdAt: new Date("2026-04-01T00:00:00.000Z"),
			updatedAt: new Date("2026-04-01T00:00:00.000Z"),
			place: {
				id: 1,
				googlePlaceId: "ChIJp4JiUCNP0xQR1JaSjpW_Hms",
				name: "代々木公園",
				latitude: 35.6715,
				longitude: 139.6944,
				address: "東京都渋谷区代々木神園町2-1",
				imageUrl: null,
			},
		});

		const result = await updateFavorite(10, updateData);

		expect(result.memo).toBeNull();
	});
});

describe("deleteFavorite", () => {
	it("where: { id, userId } で deleteMany を呼ぶ", async () => {
		mockPrismaUserFavoritePlace.deleteMany.mockResolvedValueOnce({
			count: 1,
		});

		await deleteFavorite(10, 1);

		expect(mockPrismaUserFavoritePlace.deleteMany).toHaveBeenCalledTimes(1);
		const callArg = mockPrismaUserFavoritePlace.deleteMany.mock
			.calls[0][0] as {
			where: { id: number; userId: number };
		};
		expect(callArg.where.id).toBe(10);
		expect(callArg.where.userId).toBe(1);
	});
});
