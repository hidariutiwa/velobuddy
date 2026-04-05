import ActivityList from "@/components/activities/activityList";
import MonthlySummaryCard from "@/components/activities/monthlySummaryCard";
import StravaSyncButton from "@/components/activities/stravaSyncButton";
import MainContainer from "@/components/layout/mainContainer";
import { authOptions } from "@/lib/auth";
import { getActivitiesByUserId } from "@/lib/db/activity";
import { backfillMissingSummaries } from "@/lib/db/monthlySummary";
import { getStravaTokens } from "@/lib/db/strava";
import { MonthlySummary } from "@/types/activity";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) redirect("/api/auth/signin");

	const activities = await getActivitiesByUserId(session.user.id);
	const stravaTokens = await getStravaTokens(session.user.id);

	// Compute current month summary
	const now = new Date();
	const currentYear = now.getUTCFullYear();
	const currentMonth = now.getUTCMonth() + 1;

	const currentMonthActivities = activities.filter((a) => {
		if (!a.startDate) return false;
		const d = new Date(a.startDate);
		return (
			d.getUTCFullYear() === currentYear &&
			d.getUTCMonth() + 1 === currentMonth
		);
	});

	const currentMonthSummary: MonthlySummary = {
		totalDistance: currentMonthActivities.reduce(
			(sum, a) => sum + a.distance,
			0,
		),
		totalMovingTime: currentMonthActivities.reduce(
			(sum, a) => sum + a.movingTime,
			0,
		),
		activityCount: currentMonthActivities.length,
		year: currentYear,
		month: currentMonth,
	};

	// Backfill past months' summaries to DB
	await backfillMissingSummaries(session.user.id, activities);

	return (
		<MainContainer>
			<div className="relative flex h-full w-full flex-col gap-4">
				<div className="px-2 pt-2">
					<p className="text-lg font-bold">アクティビティ一覧</p>
				</div>
				<div className="h-fit w-full px-4">
					<MonthlySummaryCard summary={currentMonthSummary} />
				</div>
				<ActivityList initialActivities={activities} />
				<div className="absolute bottom-0 flex h-fit w-full items-center justify-between gap-4 p-4">
					<StravaSyncButton stravaConnected={stravaTokens !== null} />
					<Link
						href="/activities/new"
						className="flex h-13 w-13 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white shadow-lg shadow-blue-500/35"
					>
						+
					</Link>
				</div>
			</div>
		</MainContainer>
	);
}
