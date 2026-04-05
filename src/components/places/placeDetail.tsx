import { PlaceCache } from "@/types/place";

export default function PlaceDetail({
	place,
	children,
}: {
	place: PlaceCache;
	children?: React.ReactNode;
}) {
	return (
		<>
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-zinc-800">
					{place.name}
				</h1>
				{children}
			</div>

			{place.address && (
				<p className="text-sm text-zinc-500">{place.address}</p>
			)}
		</>
	);
}
