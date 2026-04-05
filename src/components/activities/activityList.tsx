"use client";

import { ActivitySheet } from "@/components/utils/activity";
import { ActivityResponse } from "@/types/activity";
import { useState } from "react";

export default function ActivityList({
	initialActivities,
}: {
	initialActivities: ActivityResponse[];
}) {
	const [activities] = useState<ActivityResponse[]>(initialActivities);

	return (
		<div className="flex h-0 w-full grow flex-col gap-4 overflow-y-auto">
			{activities.length === 0 ? (
				<p className="ml-4">アクティビティがありません</p>
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
	);
}
