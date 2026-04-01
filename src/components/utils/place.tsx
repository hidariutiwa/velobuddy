import { MapPlace } from "@/types/map";
import { PlaceCache } from "@/types/place";
import Link from "next/link";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

function PlaceNoImage() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-400">
      <p className="text-xs text-white">No Image</p>
    </div>
  );
}

function FavoriteButton({
  isFavorite,
  onClick,
}: {
  isFavorite: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600"
      aria-label={isFavorite ? "お気に入り解除" : "お気に入り追加"}
    >
      {isFavorite ? <MdFavorite /> : <MdFavoriteBorder />}
    </button>
  );
}

export function PlaceBar({
  place,
  isFavorite,
  favoriteId,
  onFavoriteToggle,
}: {
  place: MapPlace;
  isFavorite?: boolean;
  favoriteId?: number | null;
  onFavoriteToggle?: (place: PlaceCache, favoriteId: number | null) => void;
}) {
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
        <FavoriteButton
          isFavorite={isFavorite ?? false}
          onClick={() => onFavoriteToggle?.(place, favoriteId ?? null)}
        />
      </div>
    </div>
  );
}

export function PlaceCard({
  place,
  isFavorite,
  favoriteId,
  onFavoriteToggle,
}: {
  place: MapPlace;
  isFavorite?: boolean;
  favoriteId?: number | null;
  onFavoriteToggle?: (place: PlaceCache, favoriteId: number | null) => void;
}) {
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
        <FavoriteButton
          isFavorite={isFavorite ?? false}
          onClick={() => onFavoriteToggle?.(place, favoriteId ?? null)}
        />
      </div>
    </div>
  );
}
