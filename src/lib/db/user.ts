import { PrismaClient } from "@/lib/generated/prisma/client";
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
