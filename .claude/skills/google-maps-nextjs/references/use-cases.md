# Google Maps Use Cases — TypeScript Components

All components target: Next.js App Router, React 19, TypeScript, Tailwind 4,
`@vis.gl/react-google-maps`.

> **Before using any component below**, confirm prop names and hook signatures against
> the current library by calling the MCP tools (see SKILL.md Step 1). The examples
> below are starting points; the MCP call is the authoritative source.

---

## § Basic Map Display

Shows a map centered on a given location. The simplest entry point.

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

```tsx
"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";

interface BasicMapProps {
	center: { lat: number; lng: number };
	zoom?: number;
}

export default function BasicMap({ center, zoom = 13 }: BasicMapProps) {
	return (
		<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
			<div className="h-96 w-full">
				<Map
					defaultCenter={center}
					defaultZoom={zoom}
					gestureHandling="greedy"
					disableDefaultUI={false}
				/>
			</div>
		</APIProvider>
	);
}
```

**Usage in a page:**

```tsx
// app/page.tsx
import BasicMap from "@/components/BasicMap";

export default function Page() {
	return (
		<main className="p-4">
			<BasicMap center={{ lat: 35.6762, lng: 139.6503 }} zoom={12} />
		</main>
	);
}
```

**Notes:**

- `APIProvider` must wrap all map components. Place it at the layout level if multiple
  pages use maps.
- `gestureHandling="greedy"` lets users scroll the map without holding Ctrl/Cmd.

---

## § Markers and Info Windows

Adds clickable markers with a popup info window. Requires a **Map ID** for
`AdvancedMarkerElement` (see `references/api-key-setup.md` § Map ID).

```tsx
"use client";

import {
	APIProvider,
	Map,
	AdvancedMarker,
	InfoWindow,
} from "@vis.gl/react-google-maps";
import { useState } from "react";

interface MarkerData {
	id: string;
	position: { lat: number; lng: number };
	title: string;
	description: string;
}

interface MapWithMarkersProps {
	markers: MarkerData[];
	center: { lat: number; lng: number };
	mapId: string;
}

export default function MapWithMarkers({
	markers,
	center,
	mapId,
}: MapWithMarkersProps) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const selectedMarker = markers.find((m) => m.id === selectedId) ?? null;

	return (
		<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
			<div className="h-[500px] w-full">
				<Map defaultCenter={center} defaultZoom={13} mapId={mapId}>
					{markers.map((marker) => (
						<AdvancedMarker
							key={marker.id}
							position={marker.position}
							onClick={() => setSelectedId(marker.id)}
						/>
					))}

					{selectedMarker !== null && (
						<InfoWindow
							position={selectedMarker.position}
							onCloseClick={() => setSelectedId(null)}
						>
							<div className="max-w-xs p-2">
								<h3 className="text-sm font-semibold">
									{selectedMarker.title}
								</h3>
								<p className="mt-1 text-xs text-gray-600">
									{selectedMarker.description}
								</p>
							</div>
						</InfoWindow>
					)}
				</Map>
			</div>
		</APIProvider>
	);
}
```

**Notes:**

- `mapId` is not a secret — commit it to source code.
- If you don't have a Map ID yet, fall back to the basic `Marker` component (deprecated
  but functional without Map ID) and migrate to `AdvancedMarker` once the Map ID is set up.

---

## § Places Autocomplete

Address input field that updates the map center when the user selects a place.

```tsx
"use client";

import { APIProvider, Map, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useState, useCallback } from "react";

interface PlacesAutocompleteProps {
	onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

function PlacesInput({ onPlaceSelect }: PlacesAutocompleteProps) {
	const placesLib = useMapsLibrary("places");
	const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

	// Initialize Autocomplete once the library and input are ready
	useState(() => {
		if (placesLib === null || inputRef === null) return;

		const autocomplete = new placesLib.Autocomplete(inputRef, {
			fields: ["geometry", "name", "formatted_address"],
		});

		autocomplete.addListener("place_changed", () => {
			const place = autocomplete.getPlace();
			onPlaceSelect(place.geometry ? place : null);
		});
	});

	return (
		<input
			ref={setInputRef}
			type="text"
			placeholder="Enter an address..."
			className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
	);
}

export default function MapWithAutocomplete() {
	const [center, setCenter] = useState<{ lat: number; lng: number }>({
		lat: 35.6762,
		lng: 139.6503,
	});

	const handlePlaceSelect = useCallback(
		(place: google.maps.places.PlaceResult | null) => {
			if (place?.geometry?.location) {
				setCenter({
					lat: place.geometry.location.lat(),
					lng: place.geometry.location.lng(),
				});
			}
		},
		[],
	);

	return (
		<APIProvider
			apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
			libraries={["places"]}
		>
			<div className="flex flex-col gap-3">
				<PlacesInput onPlaceSelect={handlePlaceSelect} />
				<div className="h-96 w-full">
					<Map center={center} zoom={14} />
				</div>
			</div>
		</APIProvider>
	);
}
```

**Notes:**

- Pass `libraries={['places']}` to `APIProvider` to load the Places library.
- `useMapsLibrary('places')` returns `null` until the library loads — the component
  handles this gracefully by checking before initializing `Autocomplete`.
- Verify the exact `useMapsLibrary` hook signature against the MCP docs — it may have
  changed in newer library versions.

---

## § Directions and Routing

Renders a route between an origin and destination using the Directions API.

```tsx
"use client";

import {
	APIProvider,
	Map,
	useMapsLibrary,
	useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

interface DirectionsRendererProps {
	origin: string;
	destination: string;
}

function DirectionsLayer({ origin, destination }: DirectionsRendererProps) {
	const map = useMap();
	const routingLib = useMapsLibrary("routes");
	const [renderer, setRenderer] =
		useState<google.maps.DirectionsRenderer | null>(null);

	// Create the renderer once the library is loaded
	useEffect(() => {
		if (routingLib === null || map === null) return;
		const r = new routingLib.DirectionsRenderer({ map });
		setRenderer(r);
		return () => r.setMap(null);
	}, [routingLib, map]);

	// Request directions whenever origin/destination or renderer changes
	useEffect(() => {
		if (routingLib === null || renderer === null) return;

		const service = new routingLib.DirectionsService();
		service.route(
			{
				origin,
				destination,
				travelMode: routingLib.TravelMode.DRIVING,
			},
			(result, status) => {
				if (status === "OK" && result !== null) {
					renderer.setDirections(result);
				}
			},
		);
	}, [routingLib, renderer, origin, destination]);

	return null;
}

interface RouteMapProps {
	origin: string;
	destination: string;
}

export default function RouteMap({ origin, destination }: RouteMapProps) {
	return (
		<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
			<div className="h-[500px] w-full">
				<Map
					defaultCenter={{ lat: 35.6762, lng: 139.6503 }}
					defaultZoom={10}
				>
					<DirectionsLayer
						origin={origin}
						destination={destination}
					/>
				</Map>
			</div>
		</APIProvider>
	);
}
```

**Usage:**

```tsx
<RouteMap origin="Tokyo Station" destination="Shinjuku Station" />
```

**Notes:**

- `useMapsLibrary('routes')` loads the `google.maps.DirectionsService` and
  `google.maps.DirectionsRenderer` classes.
- The Directions API must be enabled in your Cloud Console project.

---

## § Custom Map Styling

Two approaches: **local JSON** (quick, no Cloud Console) and **cloud-based Map ID**
(recommended for production, supports vector maps).

### Option A — Local mapStyle JSON (quick start)

```tsx
"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";

// Dark/minimal style — generates from https://mapstyle.withgoogle.com or snazzy maps
const darkMapStyle: google.maps.MapTypeStyle[] = [
	{ elementType: "geometry", stylers: [{ color: "#212121" }] },
	{ elementType: "labels.icon", stylers: [{ visibility: "off" }] },
	{ elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
	{ elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [{ color: "#373737" }],
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#000000" }],
	},
];

interface StyledMapProps {
	center: { lat: number; lng: number };
}

export default function DarkMap({ center }: StyledMapProps) {
	return (
		<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
			<div className="h-96 w-full">
				<Map
					defaultCenter={center}
					defaultZoom={13}
					styles={darkMapStyle}
				/>
			</div>
		</APIProvider>
	);
}
```

### Option B — Cloud-based Map ID (production)

1. Create a Map ID in Cloud Console → **Google Maps Platform → Map management**
2. Assign a style to the Map ID in the console
3. Reference the Map ID in code (no `styles` prop needed — style is applied server-side):

```tsx
"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";

export default function CloudStyledMap() {
	return (
		<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
			<div className="h-96 w-full">
				<Map
					defaultCenter={{ lat: 35.6762, lng: 139.6503 }}
					defaultZoom={13}
					mapId="YOUR_MAP_ID_HERE"
				/>
			</div>
		</APIProvider>
	);
}
```

**Notes:**

- `styles` prop applies only to raster maps. For vector maps (Map ID required), use
  cloud-based styling in the Cloud Console.
- The `styles` and `mapId` props are mutually exclusive on the `Map` component.
- Verify the exact prop name (`styles` vs `mapStyle`) against the MCP docs — it has
  changed between library versions.
