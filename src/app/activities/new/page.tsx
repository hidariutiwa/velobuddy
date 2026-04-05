import ActivityCreateForm from "@/components/activities/activityCreateForm";
import MainContainer from "@/components/layout/mainContainer";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Page() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) redirect("/api/auth/signin");
	return (
		<MainContainer>
			<ActivityCreateForm />
		</MainContainer>
	);
}
