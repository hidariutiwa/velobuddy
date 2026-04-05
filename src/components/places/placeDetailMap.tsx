"use client";

import { APIProvider, AdvancedMarker, Map } from "@vis.gl/react-google-maps";

export default function PlaceDetailMap({
	lat,
	lng,
}: {
	lat: number;
	lng: number;
}) {
	return (
		<div className="h-64 w-full overflow-hidden rounded-lg">
			<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!}>
				<Map
					mapId="DEMO_MAP_ID"
					defaultCenter={{ lat, lng }}
					defaultZoom={15}
					gestureHandling="greedy"
					disableDefaultUI={false}
					style={{ width: "100%", height: "100%" }}
				>
					<AdvancedMarker position={{ lat, lng }} />
				</Map>
			</APIProvider>
		</div>
	);
}
