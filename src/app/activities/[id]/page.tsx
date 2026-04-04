"use client";

import MainContainer from "@/components/layout/mainContainer";
import { ActivityRouteMap } from "@/components/map/ActivityRouteMap";
import { createDisplayTime } from "@/components/utils/activity";
import { ActivityResponse } from "@/types/activity";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

	const displayTime = createDisplayTime(activity.drivingTime);

	return (
		<MainContainer>
			<div className="flex h-full w-full flex-col gap-4 p-4">
				<p className="text-lg font-bold text-zinc-700">
					アクティビティ詳細
				</p>
				<div className="flex flex-col gap-3">
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">距離</span>
						<span>{activity.distance} km</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">走行時間</span>
						<span>{displayTime}</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">平均速度</span>
						<span>{activity.averageVelocity} km/h</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">最高速度</span>
						<span>{activity.maxVelocity} km/h</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">獲得標高</span>
						<span>{activity.elevation} m</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">消費カロリー</span>
						<span>{activity.burnCalories} kcal</span>
					</div>
					<div className="flex justify-between border-b border-zinc-200 py-2">
						<span className="text-zinc-500">活動日</span>
						<span>{activity.activityAt ?? "未設定"}</span>
					</div>
				</div>
				<ActivityRouteMap polyline={activity.polyline} />
			</div>
		</MainContainer>
	);
}
