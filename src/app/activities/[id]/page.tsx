"use client";

import MainContainer from "@/components/layout/mainContainer";
import { ActivityRouteMap } from "@/components/map/ActivityRouteMap";
import { createDisplayTime } from "@/components/utils/activity";
import { ActivityResponse } from "@/types/activity";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function formatSpeed(ms: number): string {
	return (ms * 3.6).toFixed(1);
}

function formatDistance(m: number): string {
	return (m / 1000).toFixed(1);
}

export default function Page() {
	const { id } = useParams<{ id: string }>();
	const { status } = useSession();
	const [activity, setActivity] = useState<ActivityResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			setIsLoading(false);
			return;
		}
		if (status !== "authenticated") {
			return;
		}

		const fetchActivity = async () => {
			try {
				const response = await fetch(`/api/activities/${id}`);
				const data: ActivityResponse = await response.json();
				setActivity(data);
			} catch {
				setActivity(null);
			} finally {
				setIsLoading(false);
			}
		};

		void fetchActivity();
	}, [status, id]);

	if (isLoading) {
		return (
			<MainContainer>
				<p>読み込み中...</p>
			</MainContainer>
		);
	}

	if (!activity) {
		return (
			<MainContainer>
				<p>アクティビティが見つかりません</p>
			</MainContainer>
		);
	}

	const movingTimeDisplay = createDisplayTime(activity.movingTime);
	const elapsedTimeDisplay = createDisplayTime(activity.elapsedTime);

	return (
		<MainContainer>
			<div className="flex h-full w-full flex-col gap-4 p-4">
				<p className="text-lg font-bold text-zinc-700">
					{activity.name || "アクティビティ詳細"}
				</p>
				<div className="flex flex-col gap-3">
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">距離</span>
						<span>{formatDistance(activity.distance)} km</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">走行時間</span>
						<span>{movingTimeDisplay}</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">経過時間</span>
						<span>{elapsedTimeDisplay}</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">平均速度</span>
						<span>{formatSpeed(activity.averageSpeed)} km/h</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">最高速度</span>
						<span>{formatSpeed(activity.maxSpeed)} km/h</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">獲得標高</span>
						<span>{activity.totalElevationGain.toFixed(1)} m</span>
					</div>
					{activity.elevHigh !== null &&
						activity.elevLow !== null && (
							<div className="flex justify-between border-b border-zinc-200 py-2">
								<span className="text-zinc-500">標高</span>
								<span>
									{activity.elevLow.toFixed(0)} 〜{" "}
									{activity.elevHigh.toFixed(0)} m
								</span>
							</div>
						)}
					{activity.averageWatts !== null && (
						<div className="flex justify-between border-b border-zinc-200 py-2">
							<span className="text-zinc-500">平均パワー</span>
							<span>
								{activity.averageWatts.toFixed(0)} W
								{!activity.deviceWatts && " (推定)"}
							</span>
						</div>
					)}
					{activity.calories !== null && (
						<div className="flex justify-between border-b border-zinc-200 py-2">
							<span className="text-zinc-500">消費カロリー</span>
							<span>{activity.calories.toFixed(0)} kcal</span>
						</div>
					)}
					{activity.averageTemp !== null && (
						<div className="flex justify-between border-b border-zinc-200 py-2">
							<span className="text-zinc-500">気温</span>
							<span>{activity.averageTemp}℃</span>
						</div>
					)}
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">活動日</span>
						<span>
							{activity.startDate
								? new Date(
										activity.startDate,
									).toLocaleDateString("ja-JP")
								: "未設定"}
						</span>
					</div>
				</div>
				<ActivityRouteMap
					polyline={activity.polyline ?? activity.summaryPolyline}
				/>
			</div>
		</MainContainer>
	);
}
