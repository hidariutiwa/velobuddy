interface MapPlaceholderProps {
	className?: string;
	showPin?: boolean;
}

export default function MapPlaceholder({
	className = "",
	showPin = false,
}: MapPlaceholderProps) {
	return (
		<div className={`relative overflow-hidden bg-zinc-200 ${className}`}>
			{/* Horizontal grid lines */}
			{[10, 20, 30, 40, 50, 60, 70, 80, 90].map((pct) => (
				<div
					key={`gh-${pct}`}
					className="absolute right-0 left-0 h-px bg-zinc-300"
					style={{ top: `${pct}%` }}
				/>
			))}
			{/* Vertical grid lines */}
			{[10, 30, 51, 72, 92].map((pct) => (
				<div
					key={`gv-${pct}`}
					className="absolute top-0 bottom-0 w-px bg-zinc-300"
					style={{ left: `${pct}%` }}
				/>
			))}
			{/* Horizontal road */}
			<div
				className="absolute right-0 left-0 h-2 bg-white"
				style={{ top: "36%" }}
			/>
			{/* Vertical road */}
			<div
				className="absolute top-0 bottom-0 w-2 bg-white"
				style={{ left: "43%" }}
			/>
			{/* Park area */}
			<div
				className="absolute rounded-xl bg-green-200"
				style={{ left: "14%", top: "43%", width: "22%", height: "22%" }}
			/>
			{/* Map pin */}
			{showPin && (
				<div
					className="absolute h-5 w-5 rounded-full bg-blue-500"
					style={{ left: "39%", top: "33%" }}
				/>
			)}
			{/* Placeholder label */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="rounded-xl bg-white/80 px-4 py-2 shadow-sm">
					<p className="text-center text-sm font-medium text-zinc-500">
						ここにGoogle Mapが表示されます
					</p>
				</div>
			</div>
		</div>
	);
}
