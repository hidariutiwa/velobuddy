import MainContainer from "@/components/layout/mainContainer";
import ProfileEditForm from "@/components/profile/profileEditForm";
import { authOptions } from "@/lib/auth";
import { getUserProfile } from "@/lib/db/user";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ProfileEditPage() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) redirect("/api/auth/signin");

	const profile = await getUserProfile(session.user.id);
	if (!profile) redirect("/api/auth/signin");

	return (
		<MainContainer>
			<ProfileEditForm initialProfile={profile} />
		</MainContainer>
	);
}
