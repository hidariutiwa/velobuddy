"use client";

import MainContainer from "@/components/layout/mainContainer";
import { ActivitySheet } from "@/components/utils/activity";
import { ActivityResponse } from "@/types/activity";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function Page() {
	const { status } = useSession();
	const [activities, setActivities] = useState<ActivityResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [stravaConnected, setStravaConnected] = useState<boolean | null>(
		null,
	);
	const [isSyncing, setIsSyncing] = useState(false);
	const [syncResult, setSyncResult] = useState<string | null>(null);

	const fetchActivities = useCallback(async () => {
		try {
			const response = await fetch("/api/activities");
			const data: ActivityResponse[] = await response.json();
			setActivities(data);
		} catch {
			setActivities([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (status !== "authenticated") {
			if (status === "unauthenticated") setIsLoading(false);
			return;
		}

		void fetchActivities();

		fetch("/api/strava/status")
			.then((r) => r.json())
			.then((d: { connected: boolean }) =>
				setStravaConnected(d.connected),
			)
			.catch(() => setStravaConnected(false));
	}, [status, fetchActivities]);

	const handleSync = async () => {
		if (!stravaConnected) {
			window.location.href = "/api/strava/auth";
			return;
		}

		setIsSyncing(true);
		setSyncResult(null);
		try {
			const res = await fetch("/api/strava/sync", { method: "POST" });
			const data = await res.json();
			if (res.ok) {
				setSyncResult(
					`${data.imported}件インポート、${data.skipped}件スキップ`,
				);
				await fetchActivities();
			} else {
				setSyncResult(data.error ?? "同期に失敗しました");
			}
		} catch {
			setSyncResult("通信エラーが発生しました");
		} finally {
			setIsSyncing(false);
		}
	};

	return (
		<MainContainer>
			<div className="flex h-full w-full flex-col gap-4">
				<p>アクティビティ一覧</p>

				<button
					onClick={handleSync}
					disabled={isSyncing || stravaConnected === null}
					className="w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white disabled:opacity-50"
				>
					{isSyncing
						? "同期中..."
						: stravaConnected
							? "⟳ Stravaと同期する"
							: "Stravaを連携する"}
				</button>

				{syncResult && (
					<p className="rounded-lg bg-blue-50 p-2 text-center text-xs text-blue-700">
						{syncResult}
					</p>
				)}

				<div className="flex h-0 w-full grow flex-col gap-4 overflow-y-auto">
					{isLoading ? (
						<p>読み込み中...</p>
					) : (
						activities.map((activity) => (
							<ActivitySheet
								key={activity.id}
								activity={activity}
								id={activity.id}
							/>
						))
					)}
				</div>

				<Link
					href="/activities/new"
					className="fixed right-6 bottom-24 flex h-13 w-13 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white shadow-lg shadow-blue-500/35"
				>
					+
				</Link>
			</div>
		</MainContainer>
	);
}
