# Google Maps API Key Setup

## 1. Create a Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project selector at the top → **New Project**
3. Enter a project name and click **Create**
4. Make sure the new project is selected in the project selector

## 2. Enable Required APIs

In the Cloud Console, go to **APIs & Services → Library** and enable each of the
following APIs your project uses:

| API                     | Required for                                   |
| ----------------------- | ---------------------------------------------- |
| **Maps JavaScript API** | Displaying any map (`APIProvider`, `Map`)      |
| **Places API** (New)    | Places Autocomplete, place details             |
| **Directions API**      | Route planning, `DirectionsRenderer`           |
| **Geocoding API**       | Converting addresses to coordinates (optional) |

To enable: search for the API name → click it → click **Enable**.

At minimum, enable **Maps JavaScript API** for every integration.

## 3. Create an API Key

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → API key**
3. The key is created immediately — copy it now
4. Click **Edit API key** to apply restrictions (see next section)

## 4. Restrict the API Key

Unrestricted keys can be misused if leaked. Apply these restrictions:

### Application restrictions (HTTP referrers)

Under **Application restrictions**, select **HTTP referrers (websites)** and add:

```
localhost:3000/*
localhost:3001/*
https://your-production-domain.com/*
https://*.your-production-domain.com/*
```

- Include `localhost` entries for local development.
- Use `/*` suffix to match all paths.
- Add your production domain(s) when you deploy.

> **Important:** Do NOT use "IP addresses" restriction for browser-side keys. The Maps
> JavaScript API runs in the user's browser, not on your server, so the IP changes
> constantly. HTTP referrer restriction is the correct choice.

### API restrictions

Under **API restrictions**, select **Restrict key** and choose only the APIs you enabled
in Step 2. This limits damage if the key is ever exposed.

Click **Save**.

## 5. Add the Key to Your Next.js Project

Create or update `.env.local` at your project root:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here
```

The `NEXT_PUBLIC_` prefix makes the value available in browser bundles. Without it,
`process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` will be `undefined` at runtime.

Make sure `.env.local` is in `.gitignore` (it is by default in Next.js):

```bash
# .gitignore (should already contain this)
.env.local
```

## 6. Using the Key in Code

```tsx
// In any component that wraps maps
<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
	...
</APIProvider>
```

The non-null assertion (`!`) is appropriate here — if the key is missing, the map will
fail to load regardless, so a runtime error is preferable to silent failure.

## 7. Map ID (for Advanced Features)

`AdvancedMarkerElement` and cloud-based custom styling require a **Map ID**:

1. In Cloud Console → **Google Maps Platform → Map management**
2. Click **Create Map ID**
3. Enter a name, select **JavaScript** platform, choose **Raster** or **Vector** type
4. Click **Save** — copy the generated Map ID

Pass it to the `Map` component:

```tsx
<Map mapId="YOUR_MAP_ID_HERE" ... />
```

Note: Map IDs are not secret — they can be committed to source code unlike API keys.

## Common Issues

| Error                       | Cause                                 | Fix                                          |
| --------------------------- | ------------------------------------- | -------------------------------------------- |
| `InvalidKeyMapError`        | API key missing or wrong env var name | Check `.env.local` for `NEXT_PUBLIC_` prefix |
| `RefererNotAllowedMapError` | HTTP referrer restriction too strict  | Add `localhost:3000/*` to allowed referrers  |
| API not enabled             | Correct API not turned on             | Enable the specific API in Cloud Console     |
| Quota exceeded              | Free tier exhausted                   | Set up billing in Cloud Console              |
