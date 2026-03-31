import MainContainer from "@/components/layout/mainContainer";
import { ActivitySheet } from "@/components/utils/activity";
import { mockActivities } from "@/types/mock";

export default function Page() {
	const sheets = mockActivities.map((activity, index) => {
		return <ActivitySheet key={index} activity={activity} />;
	});

	return (
		<MainContainer>
			<div className="flex h-full w-full flex-col gap-4">
				<p>アクティビティ一覧</p>
				<div className="flex h-0 w-full grow flex-col gap-4 overflow-y-auto">
					{sheets}
				</div>
			</div>
		</MainContainer>
	);
}
