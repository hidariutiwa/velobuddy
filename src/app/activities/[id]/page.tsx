import ActivityDetail from "@/components/activities/activityDetail";
import MainContainer from "@/components/layout/mainContainer";
import { authOptions } from "@/lib/auth";
import { getActivityById } from "@/lib/db/activity";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) notFound();

	const { id } = await params;
	const activity = await getActivityById(parseInt(id, 10));
	if (!activity) notFound();

	return (
		<MainContainer>
			<ActivityDetail activity={activity} />
		</MainContainer>
	);
}
