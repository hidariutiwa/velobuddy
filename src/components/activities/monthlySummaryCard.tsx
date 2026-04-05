import { createDisplayTime } from "@/components/utils/activity";
import { MonthlySummary } from "@/types/activity";

export default function MonthlySummaryCard({
	summary,
}: {
	summary: MonthlySummary;
}) {
	const distanceKm = (summary.totalDistance / 1000).toFixed(1);
	const displayTime = createDisplayTime(summary.totalMovingTime);

	return (
		<div className="rounded-lg border border-zinc-200 bg-white p-4">
			<p className="mb-3 text-sm font-medium text-zinc-700">
				{summary.year}年{summary.month}月
			</p>
			<div className="grid grid-cols-3 text-center">
				<div>
					<p className="text-xs text-zinc-500">距離</p>
					<p className="text-lg font-bold">
						{distanceKm}
						<span className="text-xs font-normal"> km</span>
					</p>
				</div>
				<div>
					<p className="text-xs text-zinc-500">時間</p>
					<p className="text-lg font-bold">{displayTime}</p>
				</div>
				<div>
					<p className="text-xs text-zinc-500">回数</p>
					<p className="text-lg font-bold">
						{summary.activityCount}
						<span className="text-xs font-normal"> 回</span>
					</p>
				</div>
			</div>
		</div>
	);
}
