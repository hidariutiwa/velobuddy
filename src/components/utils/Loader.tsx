import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface LoaderProps {
	label?: string;
}

export function Loader({ label = "読み込み中..." }: LoaderProps) {
	return (
		<div className="flex w-full flex-col items-center justify-center gap-2 py-12">
			<AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-blue-600" />
			<p className="text-sm text-zinc-400">{label}</p>
		</div>
	);
}
