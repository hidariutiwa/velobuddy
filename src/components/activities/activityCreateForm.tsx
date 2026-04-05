"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SPORT_TYPES = ["Ride", "EBikeRide", "VirtualRide"] as const;
const SPORT_TYPE_LABELS: Record<string, string> = {
	Ride: "Ride",
	EBikeRide: "E-Bike",
	VirtualRide: "Virtual",
};

function parseTimeToSeconds(time: string): number | null {
	const parts = time.split(":").map(Number);
	if (parts.some(isNaN)) return null;
	if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
	if (parts.length === 2) return parts[0] * 60 + parts[1];
	return null;
}

export default function ActivityCreateForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [name, setName] = useState("");
	const [startDate, setStartDate] = useState("");
	const [distanceKm, setDistanceKm] = useState("");
	const [movingTimeStr, setMovingTimeStr] = useState("");
	const [elapsedTimeStr, setElapsedTimeStr] = useState("");
	const [maxSpeedKmh, setMaxSpeedKmh] = useState("");
	const [totalElevationGain, setTotalElevationGain] = useState("");
	const [calories, setCalories] = useState("");
	const [averageTemp, setAverageTemp] = useState("");
	const [sportType, setSportType] = useState<string>("Ride");
	const [trainer, setTrainer] = useState(false);
	const [commute, setCommute] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const distKm = parseFloat(distanceKm);
		const movingTime = parseTimeToSeconds(movingTimeStr);
		const elapsedTime = parseTimeToSeconds(elapsedTimeStr) ?? movingTime;

		if (isNaN(distKm) || distKm <= 0) {
			setError("距離を入力してください");
			return;
		}
		if (movingTime === null || movingTime <= 0) {
			setError("走行時間を HH:MM:SS 形式で入力してください");
			return;
		}
		if (elapsedTime === null || elapsedTime <= 0) {
			setError("経過時間を HH:MM:SS 形式で入力してください");
			return;
		}

		const distanceM = distKm * 1000;
		const averageSpeedMs = distanceM / movingTime;
		const maxSpeedMs = maxSpeedKmh
			? parseFloat(maxSpeedKmh) / 3.6
			: averageSpeedMs;

		setIsSubmitting(true);
		try {
			const res = await fetch("/api/activities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name || undefined,
					sportType,
					startDate: startDate || undefined,
					distance: distanceM,
					movingTime,
					elapsedTime,
					averageSpeed: averageSpeedMs,
					maxSpeed: maxSpeedMs,
					totalElevationGain: totalElevationGain
						? parseFloat(totalElevationGain)
						: 0,
					calories: calories ? parseFloat(calories) : undefined,
					averageTemp: averageTemp
						? parseFloat(averageTemp)
						: undefined,
					trainer,
					commute,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				setError(data.error ?? "保存に失敗しました");
				return;
			}

			router.push("/activities");
		} catch {
			setError("通信エラーが発生しました");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-4">
			<div className="flex items-center gap-2">
				<button
					onClick={() => router.back()}
					className="text-2xl text-blue-500"
				>
					‹
				</button>
				<h1 className="text-lg font-bold text-zinc-700">
					アクティビティを記録
				</h1>
			</div>

			{error && (
				<p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
					{error}
				</p>
			)}

			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm"
			>
				<p className="text-xs text-zinc-400">* は必須項目です</p>

				<label className="flex flex-col gap-1">
					<span className="text-xs text-zinc-500">
						アクティビティ名
					</span>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="朝のサイクリング"
						className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
					/>
				</label>

				<label className="flex flex-col gap-1">
					<span className="text-xs text-zinc-500">活動日時</span>
					<input
						type="datetime-local"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
					/>
				</label>

				<div className="grid grid-cols-2 gap-3">
					<label className="flex flex-col gap-1">
						<span className="text-xs font-bold text-zinc-700">
							距離 (km) *
						</span>
						<input
							type="number"
							step="0.1"
							value={distanceKm}
							onChange={(e) => setDistanceKm(e.target.value)}
							placeholder="0.0"
							required
							className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
						/>
					</label>
					<label className="flex flex-col gap-1">
						<span className="text-xs font-bold text-zinc-700">
							走行時間 *
						</span>
						<input
							type="text"
							value={movingTimeStr}
							onChange={(e) => setMovingTimeStr(e.target.value)}
							placeholder="HH:MM:SS"
							required
							className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
						/>
					</label>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<label className="flex flex-col gap-1">
						<span className="text-xs font-bold text-zinc-700">
							経過時間 *
						</span>
						<input
							type="text"
							value={elapsedTimeStr}
							onChange={(e) => setElapsedTimeStr(e.target.value)}
							placeholder="HH:MM:SS"
							required
							className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
						/>
					</label>
					<label className="flex flex-col gap-1">
						<span className="text-xs text-zinc-500">
							最高速度 (km/h)
						</span>
						<input
							type="number"
							step="0.1"
							value={maxSpeedKmh}
							onChange={(e) => setMaxSpeedKmh(e.target.value)}
							placeholder="自動計算"
							className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
						/>
					</label>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<label className="flex flex-col gap-1">
						<span className="text-xs text-zinc-500">
							獲得標高 (m)
						</span>
						<input
							type="number"
							step="0.1"
							value={totalElevationGain}
							onChange={(e) =>
								setTotalElevationGain(e.target.value)
							}
							placeholder="0.0"
							className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
						/>
					</label>
					<label className="flex flex-col gap-1">
						<span className="text-xs text-zinc-500">
							カロリー (kcal)
						</span>
						<input
							type="number"
							value={calories}
							onChange={(e) => setCalories(e.target.value)}
							placeholder="0"
							className="rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
						/>
					</label>
				</div>

				<label className="flex flex-col gap-1">
					<span className="text-xs text-zinc-500">気温 (℃)</span>
					<input
						type="number"
						value={averageTemp}
						onChange={(e) => setAverageTemp(e.target.value)}
						placeholder=""
						className="w-1/2 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
					/>
				</label>

				<div className="flex flex-col gap-1">
					<span className="text-xs text-zinc-500">種別</span>
					<div className="flex gap-2">
						{SPORT_TYPES.map((t) => (
							<button
								key={t}
								type="button"
								onClick={() => setSportType(t)}
								className={`rounded-lg px-4 py-2 text-xs font-semibold ${
									sportType === t
										? "bg-blue-500 text-white"
										: "border border-zinc-300 text-zinc-500"
								}`}
							>
								{SPORT_TYPE_LABELS[t]}
							</button>
						))}
					</div>
				</div>

				<div className="flex gap-6">
					<label className="flex items-center gap-2 text-xs text-zinc-500">
						<input
							type="checkbox"
							checked={trainer}
							onChange={(e) => setTrainer(e.target.checked)}
							className="h-4 w-4 rounded border-zinc-300"
						/>
						インドアトレーナー
					</label>
					<label className="flex items-center gap-2 text-xs text-zinc-500">
						<input
							type="checkbox"
							checked={commute}
							onChange={(e) => setCommute(e.target.checked)}
							className="h-4 w-4 rounded border-zinc-300"
						/>
						通勤
					</label>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					className="rounded-xl bg-blue-500 py-3 text-sm font-bold text-white disabled:opacity-50"
				>
					{isSubmitting ? "保存中..." : "保存する"}
				</button>

				<button
					type="button"
					onClick={() => router.back()}
					className="py-2 text-sm text-zinc-400"
				>
					キャンセル
				</button>
			</form>
		</div>
	);
}
