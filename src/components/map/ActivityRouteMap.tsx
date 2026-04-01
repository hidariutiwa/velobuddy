"use client";

import {
	APIProvider,
	Map,
	Polyline,
	useMap,
	useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useEffect } from "react";

interface ActivityRouteMapProps {
	polyline: string | null;
}

function RoutePolyline({ encodedPath }: { encodedPath: string }) {
	const map = useMap();
	const geometryLib = useMapsLibrary("geometry");

	useEffect(() => {
		if (!map || !geometryLib) return;
		const path = geometryLib.encoding.decodePath(encodedPath);
		const bounds = new google.maps.LatLngBounds();
		path.forEach((point) => bounds.extend(point));
		map.fitBounds(bounds, 32);
	}, [map, geometryLib, encodedPath]);

	return (
		<Polyline
			encodedPath={encodedPath}
			strokeColor="#3b82f6"
			strokeWeight={4}
			strokeOpacity={0.8}
		/>
	);
}

export function ActivityRouteMap({ polyline }: ActivityRouteMapProps) {
	if (!polyline) {
		return (
			<div className="flex h-40 w-full items-center justify-center bg-zinc-100">
				<p className="text-sm text-zinc-400">ルートデータなし</p>
			</div>
		);
	}

	return (
		<div className="h-40 w-full">
			<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!}>
				<Map
					mapId="DEMO_MAP_ID"
					defaultCenter={{ lat: 35.6714, lng: 139.6956 }}
					defaultZoom={14}
					gestureHandling="none"
					disableDefaultUI={true}
					style={{ width: "100%", height: "100%" }}
				>
					<RoutePolyline encodedPath={polyline} />
				</Map>
			</APIProvider>
		</div>
	);
}
