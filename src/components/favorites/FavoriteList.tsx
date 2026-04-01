import { PlaceCard } from "./PlaceCard";
import { FavoritePlace } from "@/types/place";

interface FavoriteListProps {
	favorites: FavoritePlace[];
	isLoading: boolean;
	onVisitedToggle: (id: number, visited: boolean) => void;
	onMemoUpdate: (id: number, memo: string | null) => void;
	onDelete: (id: number) => void;
}

function LoadingSkeleton() {
	return (
		<div className="flex w-full animate-pulse flex-col gap-3 rounded-xl bg-white p-4 shadow">
			<div className="flex w-full items-start gap-4">
				<div className="h-16 w-16 shrink-0 rounded-xl bg-zinc-200" />
				<div className="flex grow flex-col gap-2">
					<div className="h-4 w-2/3 rounded bg-zinc-200" />
					<div className="h-3 w-1/2 rounded bg-zinc-200" />
				</div>
			</div>
			<div className="h-3 w-1/4 rounded-full bg-zinc-200" />
			<div className="h-12 w-full rounded-lg bg-zinc-200" />
		</div>
	);
}

export function FavoriteList({
	favorites,
	isLoading,
	onVisitedToggle,
	onMemoUpdate,
	onDelete,
}: FavoriteListProps) {
	if (isLoading) {
		return (
			<div className="flex w-full flex-col gap-4">
				<LoadingSkeleton />
				<LoadingSkeleton />
				<LoadingSkeleton />
			</div>
		);
	}

	if (favorites.length === 0) {
		return (
			<div className="flex w-full items-center justify-center py-16">
				<p className="text-sm text-zinc-400">
					お気に入りスポットはまだありません
				</p>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-col gap-4">
			{favorites.map((favorite) => (
				<PlaceCard
					key={favorite.id}
					favorite={favorite}
					onVisitedToggle={onVisitedToggle}
					onMemoUpdate={onMemoUpdate}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
}
