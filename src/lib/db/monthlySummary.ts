import { PrismaClient } from "@/lib/generated/prisma/client";
import { ActivityResponse, MonthlySummary } from "@/types/activity";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({ adapter });

export async function upsertMonthlySummary(
	userId: number,
	summary: MonthlySummary,
): Promise<void> {
	await prisma.monthlyActivitySummary.upsert({
		where: {
			userId_year_month: {
				userId,
				year: summary.year,
				month: summary.month,
			},
		},
		update: {
			totalDistance: summary.totalDistance,
			totalMovingTime: summary.totalMovingTime,
			activityCount: summary.activityCount,
		},
		create: {
			userId,
			year: summary.year,
			month: summary.month,
			totalDistance: summary.totalDistance,
			totalMovingTime: summary.totalMovingTime,
			activityCount: summary.activityCount,
		},
	});
}

export async function backfillMissingSummaries(
	userId: number,
	activities: ActivityResponse[],
): Promise<void> {
	const now = new Date();
	const currentYear = now.getUTCFullYear();
	const currentMonth = now.getUTCMonth() + 1;

	// Group activities by year/month (exclude current month and null startDate)
	const monthlyMap = new Map<string, ActivityResponse[]>();
	for (const activity of activities) {
		if (!activity.startDate) continue;
		const d = new Date(activity.startDate);
		const year = d.getUTCFullYear();
		const month = d.getUTCMonth() + 1;
		if (year === currentYear && month === currentMonth) continue;
		const key = `${year}-${month}`;
		const list = monthlyMap.get(key) ?? [];
		list.push(activity);
		monthlyMap.set(key, list);
	}

	if (monthlyMap.size === 0) return;

	// Fetch existing summaries
	const existing = await prisma.monthlyActivitySummary.findMany({
		where: { userId },
		select: { year: true, month: true },
	});
	const existingKeys = new Set(existing.map((e) => `${e.year}-${e.month}`));

	// Upsert missing months
	for (const [key, monthActivities] of monthlyMap) {
		if (existingKeys.has(key)) continue;
		const [yearStr, monthStr] = key.split("-");
		const summary: MonthlySummary = {
			year: Number(yearStr),
			month: Number(monthStr),
			totalDistance: monthActivities.reduce(
				(sum, a) => sum + a.distance,
				0,
			),
			totalMovingTime: monthActivities.reduce(
				(sum, a) => sum + a.movingTime,
				0,
			),
			activityCount: monthActivities.length,
		};
		await upsertMonthlySummary(userId, summary);
	}
}
