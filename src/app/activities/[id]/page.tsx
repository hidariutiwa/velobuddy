import { mockPlaces } from "@/types/map";

export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	return <div className="h-full w-full">place_id: {id}</div>;
}
