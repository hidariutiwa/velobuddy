# Next.js SSR Patterns for Google Maps

Google Maps APIs only execute in the browser. This reference covers how to prevent
server-side rendering (SSR) errors and handle the App Router / Pages Router difference.

---

## App Router (this project's default)

Mark any component that uses `APIProvider`, `Map`, or map hooks as a Client Component
by adding `'use client'` as the **very first line** of the file:

```tsx
"use client"; // ← must be line 1, before any imports
import { APIProvider, Map } from "@vis.gl/react-google-maps";

export default function MapComponent() {
	return (
		<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
			<Map
				defaultCenter={{ lat: 35.6762, lng: 139.6503 }}
				defaultZoom={12}
			/>
		</APIProvider>
	);
}
```

**Where to place `APIProvider`:**

- If only one page uses maps → put `APIProvider` inside that page's component.
- If multiple pages use maps → put `APIProvider` in a shared layout (`app/layout.tsx`),
  but note that the layout file itself must also become a Client Component.
- Alternatively, wrap only the specific route segment's layout.

```tsx
// app/map-section/layout.tsx
"use client";

import { APIProvider } from "@vis.gl/react-google-maps";

export default function MapLayout({ children }: { children: React.ReactNode }) {
	return (
		<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
			{children}
		</APIProvider>
	);
}
```

---

## Pages Router

Use `next/dynamic` with `ssr: false` to prevent SSR for map components:

```tsx
// pages/map-page.tsx
import dynamic from "next/dynamic";

// MapComponent must NOT be rendered on the server
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
	ssr: false,
	loading: () => <div className="h-96 w-full animate-pulse bg-gray-100" />,
});

export default function MapPage() {
	return (
		<main className="p-4">
			<MapComponent />
		</main>
	);
}
```

The `loading` prop shows a placeholder while the component hydrates — prevents layout
shift and gives users immediate visual feedback.

---

## Side-by-Side Comparison

| Concern                 | App Router                        | Pages Router                              |
| ----------------------- | --------------------------------- | ----------------------------------------- |
| Prevent SSR             | `'use client'` directive          | `dynamic(..., { ssr: false })`            |
| `APIProvider` placement | Client Component or Client layout | Inside the dynamically imported component |
| TypeScript types        | `@types/google.maps` (if needed)  | Same                                      |

---

## Map ID Setup

Some features require a Map ID:

| Feature                                    | Map ID required? |
| ------------------------------------------ | ---------------- |
| `AdvancedMarkerElement` / `AdvancedMarker` | Yes              |
| Cloud-based custom styling                 | Yes              |
| Basic `Marker` (deprecated)                | No               |
| `mapStyle` JSON (local styling)            | No               |

**Create a Map ID:**

1. Cloud Console → **Google Maps Platform → Map management → Create Map ID**
2. Platform: **JavaScript**, Type: **Raster** (compatible with `styles` prop) or **Vector**
   (required for cloud-based styling and best performance)
3. Copy the generated Map ID

**Use it in code:**

```tsx
<Map mapId="YOUR_MAP_ID_HERE" defaultCenter={...} defaultZoom={13}>
    <AdvancedMarker position={...} />
</Map>
```

Map IDs are not secrets — commit them to source code.

---

## TypeScript — Global `google.maps` Types

If TypeScript complains about `google.maps.*` types, install the type definitions:

```bash
npm install --save-dev @types/google.maps
```

These provide the `google.maps.places.PlaceResult`, `google.maps.DirectionsRenderer`,
and other global types used in the use-case components.

---

## Common Error Table

| Error message                     | Root cause                                 | Fix                                                                                           |
| --------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `window is not defined`           | Map code running during SSR                | Add `'use client'` (App Router) or `{ ssr: false }` (Pages Router)                            |
| `google is not defined`           | Using map APIs before `APIProvider` loads  | Ensure `APIProvider` wraps all map components; use `useMapsLibrary` hook for lazy-loaded APIs |
| `InvalidKeyMapError`              | API key missing or env var name wrong      | Check `.env.local` for `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — note the `NEXT_PUBLIC_` prefix     |
| `RefererNotAllowedMapError`       | HTTP referrer restriction blocking request | Add `localhost:3000/*` to allowed referrers in Cloud Console                                  |
| `MissingKeyMapError`              | Empty string passed as `apiKey`            | Verify `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is defined at runtime                    |
| Map renders but markers invisible | Using `AdvancedMarker` without Map ID      | Create a Map ID and pass it via `mapId` prop on `<Map>`                                       |
| `styles` prop has no effect       | Using vector map type with `mapId`         | Use cloud-based styling in Cloud Console, or switch to raster Map ID type                     |
