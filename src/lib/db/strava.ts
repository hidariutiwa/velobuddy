import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

export interface StravaTokens {
	accessToken: string;
	refreshToken: string;
	expiresAt: number;
	athleteId: number;
}

export async function saveStravaTokens(
	userId: number,
	tokens: StravaTokens,
): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			stravaAthleteId: tokens.athleteId,
			stravaAccessToken: tokens.accessToken,
			stravaRefreshToken: tokens.refreshToken,
			stravaTokenExpiresAt: tokens.expiresAt,
		},
	});
}

export async function getStravaTokens(
	userId: number,
): Promise<StravaTokens | null> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			stravaAthleteId: true,
			stravaAccessToken: true,
			stravaRefreshToken: true,
			stravaTokenExpiresAt: true,
		},
	});

	if (
		!user?.stravaAthleteId ||
		!user.stravaAccessToken ||
		!user.stravaRefreshToken ||
		!user.stravaTokenExpiresAt
	) {
		return null;
	}

	return {
		athleteId: user.stravaAthleteId,
		accessToken: user.stravaAccessToken,
		refreshToken: user.stravaRefreshToken,
		expiresAt: user.stravaTokenExpiresAt,
	};
}

export async function disconnectStrava(userId: number): Promise<void> {
	await prisma.user.update({
		where: { id: userId },
		data: {
			stravaAthleteId: null,
			stravaAccessToken: null,
			stravaRefreshToken: null,
			stravaTokenExpiresAt: null,
		},
	});
}
