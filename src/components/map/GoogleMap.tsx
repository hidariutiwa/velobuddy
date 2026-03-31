"use client";

import { AdvancedMarker, APIProvider, Map } from "@vis.gl/react-google-maps";

interface MarkerItem {
	id: string;
	lat: number;
	lng: number;
	label?: string;
}

interface GoogleMapProps {
	className?: string;
	center?: { lat: number; lng: number };
	zoom?: number;
	markers?: MarkerItem[];
}

const DEFAULT_CENTER = { lat: 35.6714, lng: 139.6956 };
const DEFAULT_ZOOM = 14;

export default function GoogleMap({
	className = "",
	center = DEFAULT_CENTER,
	zoom = DEFAULT_ZOOM,
	markers = [],
}: GoogleMapProps) {
	return (
		<div className={className}>
			<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY!}>
				<Map
					mapId="DEMO_MAP_ID"
					defaultCenter={center}
					defaultZoom={zoom}
					gestureHandling="greedy"
					disableDefaultUI={true}
					style={{ width: "100%", height: "100%" }}
				>
					{markers.map((marker) => (
						<AdvancedMarker
							key={marker.id}
							position={{ lat: marker.lat, lng: marker.lng }}
							title={marker.label}
						/>
					))}
				</Map>
			</APIProvider>
		</div>
	);
}
