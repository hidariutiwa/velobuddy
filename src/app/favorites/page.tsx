import FavoritesPageClient from "@/components/favorites/favoritesPageClient";
import MainContainer from "@/components/layout/mainContainer";
import { authOptions } from "@/lib/auth";
import { getFavoritesByUserId } from "@/lib/db/place";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function FavoritesPage() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.id) redirect("/api/auth/signin");

	const favorites = await getFavoritesByUserId(session.user.id);

	return (
		<MainContainer>
			<FavoritesPageClient initialFavorites={favorites} />
		</MainContainer>
	);
}
