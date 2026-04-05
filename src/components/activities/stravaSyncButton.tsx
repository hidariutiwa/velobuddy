"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StravaSyncButton({
	stravaConnected,
}: {
	stravaConnected: boolean;
}) {
	const router = useRouter();
	const [isSyncing, setIsSyncing] = useState(false);
	const [syncResult, setSyncResult] = useState<string | null>(null);

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
				router.refresh();
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
		<>
			<button
				onClick={handleSync}
				disabled={isSyncing}
				className="h-fit w-fit rounded-xl bg-blue-500 px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
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
		</>
	);
}
