import { PrismaClient } from "@/lib/generated/prisma/client";
import { UpdateUserProfileInput, UserProfile } from "@/types/user";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({
	adapter,
});
export async function findOrCreateUserByGoogle(
	googleId: string,
	email: string,
	nickname: string,
) {
	const existingUser = await prisma.user.findUnique({
		where: { googleId },
	});

	if (existingUser !== null) {
		return existingUser;
	}

	const userByEmail = await prisma.user.findUnique({
		where: { email },
	});

	if (userByEmail !== null) {
		return prisma.user.update({
			where: { email },
			data: { googleId },
		});
	}

	return prisma.user.create({
		data: {
			googleId,
			email,
			nickname,
		},
	});
}

export async function getUserProfile(
	userId: number,
): Promise<UserProfile | null> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (user === null) {
		return null;
	}

	return {
		id: user.id,
		nickname: user.nickname,
		email: user.email,
		birthday: user.birthday !== null ? user.birthday.toISOString() : null,
		sex: user.sex,
	};
}

export async function updateUserProfile(
	userId: number,
	data: UpdateUserProfileInput,
): Promise<UserProfile> {
	const updated = await prisma.user.update({
		where: { id: userId },
		data: {
			...(data.nickname !== undefined && { nickname: data.nickname }),
			...(data.birthday !== undefined && {
				birthday:
					data.birthday !== null ? new Date(data.birthday) : null,
			}),
			...(data.sex !== undefined && { sex: data.sex }),
		},
	});

	return {
		id: updated.id,
		nickname: updated.nickname,
		email: updated.email,
		birthday:
			updated.birthday !== null ? updated.birthday.toISOString() : null,
		sex: updated.sex,
	};
}
