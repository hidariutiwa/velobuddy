"use client";

import MainContainer from "@/components/layout/mainContainer";
import { ActivitySheet } from "@/components/utils/activity";
import { ActivityResponse } from "@/types/activity";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Page() {
	const { status } = useSession();
	const [activities, setActivities] = useState<ActivityResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			setIsLoading(false);
			return;
		}
		if (status !== "authenticated") {
			return;
		}

		const fetchActivities = async () => {
			try {
				const response = await fetch("/api/activities");
				const data: ActivityResponse[] = await response.json();
				setActivities(data);
			} catch {
				setActivities([]);
			} finally {
				setIsLoading(false);
			}
		};

		void fetchActivities();
	}, [status]);

	return (
		<MainContainer>
			<div className="flex h-full w-full flex-col gap-4">
				<p>アクティビティ一覧</p>
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
			</div>
		</MainContainer>
	);
}
