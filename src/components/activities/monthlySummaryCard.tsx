import { createDisplayTime } from "@/components/utils/activity";
import { MonthlySummary } from "@/types/activity";

function VerticalBorder() {
	return <div className="h-10 w-0 border-l border-zinc-400"></div>;
}

export default function MonthlySummaryCard({
	summary,
}: {
	summary: MonthlySummary;
}) {
	const distanceKm = (summary.totalDistance / 1000).toFixed(1);
	const displayTime = createDisplayTime(summary.totalMovingTime);

	return (
		<div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-1 text-blue-500">
			<div className="h-fit w-full pl-2">
				<p className="text-sm font-medium text-zinc-700">
					{summary.year}年{summary.month}月
				</p>
			</div>
			<div className="flex h-full w-full items-center justify-between">
				<div className="flex h-full w-full flex-col items-center justify-center">
					<p className="text-xs text-zinc-500">距離</p>
					<p className="text-lg font-bold">
						{distanceKm}
						<span className="text-xs font-normal text-zinc-500">
							{" "}
							km
						</span>
					</p>
				</div>
				<VerticalBorder />
				<div className="flex h-full w-full flex-col items-center justify-center">
					<p className="text-xs text-zinc-500">時間</p>
					<p className="text-lg font-bold">{displayTime}</p>
				</div>
				<VerticalBorder />
				<div className="flex h-full w-full flex-col items-center justify-center">
					<p className="text-xs text-zinc-500">回数</p>
					<p className="text-lg font-bold">
						{summary.activityCount}
						<span className="text-xs font-normal text-zinc-500">
							{" "}
							回
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}
