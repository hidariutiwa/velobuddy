import { ActivityRouteMap } from "@/components/map/ActivityRouteMap";
import { ActivityResponse } from "@/types/activity";
import Link from "next/link";

function createDisplayTime(seconds: number): string {
	const displaySeconds = (seconds % 60).toString().padStart(2, "0");
	const minutes = Math.floor(seconds / 60);
	const displayMinutes = (minutes % 60).toString().padStart(2, "0");
	const displayHours = Math.floor(minutes / 60)
		.toString()
		.padStart(2, "0");

	const displayTime = `${displayHours}:${displayMinutes}:${displaySeconds}`;

	return displayTime;
}

function ActivityInformation({ activity }: { activity: ActivityResponse }) {
	const displayTime = createDisplayTime(activity.drivingTime);

	return (
		<div className="flex h-24 w-full flex-col items-start justify-center gap-2 p-3">
			<p className="font-bold">
				{activity.distance}
				<span className="text-sm"> km</span>
			</p>
			<p className="text-base">{displayTime}</p>
		</div>
	);
}

export { createDisplayTime };

export function ActivitySheet({
	activity,
	id,
}: {
	activity: ActivityResponse;
	id: number;
}) {
	return (
		<Link href={`/activities/${id}`}>
			<div className="flex h-fit w-full flex-col border-t border-b border-zinc-200 bg-white">
				<ActivityInformation activity={activity} />
				<ActivityRouteMap polyline={activity.polyline} />
			</div>
		</Link>
	);
}
