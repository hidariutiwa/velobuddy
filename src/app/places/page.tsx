import MainContainer from "@/components/layout/mainContainer";
import { PlaceCard } from "@/components/utils/place";
import { SearchBar } from "@/components/utils/search";
import { mockPlaces } from "@/types/map";

export default function Page() {
	const cards = mockPlaces.map((place, index) => {
		return <PlaceCard key={index} place={place} />;
	});

	return (
		<MainContainer>
			<div className="b flex h-full w-full flex-col items-center justify-start gap-4 p-4">
				<SearchBar />
				<div className="flex h-0 w-full grow flex-col justify-start gap-4 overflow-y-auto">
					{cards}
				</div>
			</div>
		</MainContainer>
	);
}
