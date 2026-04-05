import MainContainer from "@/components/layout/mainContainer";
import ProfileView from "@/components/profile/profileView";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) redirect("/api/auth/signin");

	const userName = session.user.name ?? "ユーザー";

	return (
		<MainContainer>
			<ProfileView userName={userName} />
		</MainContainer>
	);
}
