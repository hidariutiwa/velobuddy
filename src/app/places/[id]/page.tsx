import MainContainer from "@/components/layout/mainContainer";
import FavoriteToggleButton from "@/components/places/favoriteToggleButton";
import PlaceDetail from "@/components/places/placeDetail";
import PlaceDetailMap from "@/components/places/placeDetailMap";
import { authOptions } from "@/lib/auth";
import { getPlaceById, getFavoritesByUserId } from "@/lib/db/place";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const place = await getPlaceById(parseInt(id, 10));
	if (!place) notFound();

	const session = await getServerSession(authOptions);
	let initialFavoriteId: number | null = null;
	if (session?.user?.id) {
		const favorites = await getFavoritesByUserId(session.user.id);
		const match = favorites.find(
			(f) => f.place.googlePlaceId === place.googlePlaceId,
		);
		if (match) initialFavoriteId = match.id;
	}

	return (
		<MainContainer>
			<div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-4">
				<PlaceDetail place={place}>
					{session?.user?.id && (
						<FavoriteToggleButton
							place={place}
							initialFavoriteId={initialFavoriteId}
						/>
					)}
				</PlaceDetail>
				{place.latitude !== null && place.longitude !== null && (
					<PlaceDetailMap
						lat={place.latitude}
						lng={place.longitude}
					/>
				)}
			</div>
		</MainContainer>
	);
}
