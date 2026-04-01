import { MapPlace } from "@/types/map";
import Link from "next/link";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

function PlaceNoImage() {
	return (
		<div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-400">
			<p className="text-xs text-white">No Image</p>
		</div>
	);
}

function FavoriteButton({ isFavorite }: { isFavorite: boolean }) {
	return (
		<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600">
			{isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
		</div>
	);
}

export function PlaceBar({ place }: { place: MapPlace }) {
	return (
		<div className="flex h-26 w-full items-start justify-between bg-white p-4">
			<div className="flex h-fit w-full items-center justify-start gap-4">
				<PlaceNoImage />
				<div className="flex flex-col gap-0.5 text-sm text-zinc-500">
					<Link
						href={`/spots/${place.id}`}
						className="text-base font-bold text-zinc-700"
					>
						{place.name}
					</Link>
					<p>{place.category}</p>
					<p>{place.address || ""}</p>
				</div>
			</div>
			<div className="flex h-full items-start justify-center">
				<FavoriteButton isFavorite={true} />
			</div>
		</div>
	);
}

export function PlaceCard({ place }: { place: MapPlace }) {
	return (
		<div className="flex h-24 w-full items-center justify-start gap-4 rounded-md bg-white p-4 shadow">
			<div className="flex h-fit w-full items-center justify-start gap-4">
				<PlaceNoImage />
				<div className="flex flex-col gap-0.5 text-sm text-zinc-500">
					<Link
						href={`/places/${place.id}`}
						className="text-base font-bold text-zinc-700"
					>
						{place.name}
					</Link>
					<p>{place.category}</p>
					<p>{place.address || ""}</p>
				</div>
			</div>
			<div className="flex h-full items-start justify-center">
				<FavoriteButton isFavorite={true} />
			</div>
		</div>
	);
}
