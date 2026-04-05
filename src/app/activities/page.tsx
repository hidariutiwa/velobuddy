import ActivityList from "@/components/activities/activityList";
import StravaSyncButton from "@/components/activities/stravaSyncButton";
import MainContainer from "@/components/layout/mainContainer";
import { authOptions } from "@/lib/auth";
import { getActivitiesByUserId } from "@/lib/db/activity";
import { getStravaTokens } from "@/lib/db/strava";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) redirect("/api/auth/signin");

	const activities = await getActivitiesByUserId(session.user.id);
	const stravaTokens = await getStravaTokens(session.user.id);

	return (
		<MainContainer>
			<div className="relative flex h-full w-full flex-col gap-4">
				<p>アクティビティ一覧</p>
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
