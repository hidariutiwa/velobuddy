import { FaSearch } from "react-icons/fa";

export function SearchBar() {
	return (
		<div className="relative h-fit w-full">
			<div className="absolute inset-y-0 left-0 flex h-full w-8 items-center justify-center text-zinc-400">
				<FaSearch />
			</div>
			<input
				type="text"
				className="h-fit w-full rounded-full border border-zinc-200 bg-white py-2 pr-3 pl-8 focus:outline-blue-600"
				placeholder="探す"
			/>
		</div>
	);
}
