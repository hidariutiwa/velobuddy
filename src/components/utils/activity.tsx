import { Activity } from "@/lib/generated/prisma/client";

function createDisplayTime(seconds: number): string {
	const displaySeconds = (seconds % 60).toString().padStart(2, "0");
	const minutes = Math.floor(seconds / 60);
	const displayMinutes = (minutes % 60).toString().padStart(2, "0");
	const hours = Math.floor(minutes / 60);
	const displayHours = Math.floor(minutes / 60)
		.toString()
		.padStart(2, "0");

	const displayTime = `${displayHours}:${displayMinutes}:${displaySeconds}`;

	return displayTime;
}

function ActivityInformation({ activity }: { activity: Activity }) {
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

export function ActivitySheet({ activity }: { activity: Activity }) {
	return (
		<div className="flex h-fit w-full flex-col border-t border-b border-zinc-200 bg-white">
			<ActivityInformation activity={activity} />
			{/* ここに自転車で走ったルートが載ってるGoogle　Mapを出したい */}
			<div className="flex h-40 w-full items-center justify-center bg-zinc-400">
				<p className="text-2xl text-zinc-200">Map表示エリア</p>
			</div>
		</div>
	);
}
