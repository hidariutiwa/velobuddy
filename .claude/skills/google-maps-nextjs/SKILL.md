---
name: google-maps-nextjs
description: >
    Guide for integrating Google Maps Platform into Next.js applications using the
    google-maps-platform-code-assist MCP for up-to-date documentation. Use this skill when:
    (1) Adding a Google Map to a Next.js page or component,
    (2) Implementing map markers, info windows, or custom pins,
    (3) Adding Places Autocomplete for address input,
    (4) Integrating Directions API or route visualization,
    (5) Applying custom map styling or dark-mode themes,
    (6) Setting up a Google Maps API key or troubleshooting map auth errors.
    Always use this skill when Google Maps and Next.js appear together — even if the user
    only mentions one and the context makes the other obvious.
---

# Google Maps Integration for Next.js

Integrates Google Maps Platform APIs into Next.js (App Router, TypeScript) using the
`@vis.gl/react-google-maps` library. All code is grounded in current documentation
retrieved via the `google-maps-platform-code-assist` MCP before writing anything.

---

## Step 1 — MCP Tool Protocol (mandatory before generating any code)

The `@vis.gl/react-google-maps` API evolves rapidly. Always call the MCP tools first
so generated component APIs, prop names, and hook signatures reflect the current library
rather than potentially outdated training data.

### 1a. Retrieve foundational instructions (always first, no parameters)

```
mcp__google-maps-platform-code-assist__retrieve-instructions
```

This loads current best practices: API versioning, quota guidance, security rules.
Never skip it.

### 1b. Retrieve targeted documentation

```
mcp__google-maps-platform-code-assist__retrieve-google-maps-platform-docs(
  prompt: "<what the user needs>",
  search_context: ["<relevant API or library>", ...]
)
```

Use the table below to choose `prompt` and `search_context` for each use case:

| User goal            | `prompt`                                                                                      | `search_context`                                                |
| -------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Show a map           | "Display a Google Map in React with @vis.gl/react-google-maps APIProvider and Map components" | `["react-google-maps", "APIProvider", "Map"]`                   |
| Markers / pins       | "Add markers and info windows to Google Map in React using AdvancedMarkerElement"             | `["react-google-maps", "AdvancedMarkerElement", "InfoWindow"]`  |
| Places Autocomplete  | "Places Autocomplete address input with @vis.gl/react-google-maps in Next.js"                 | `["Places API", "Autocomplete", "react-google-maps"]`           |
| Directions / routing | "Directions API route rendering with DirectionsRenderer in React"                             | `["Directions API", "DirectionsRenderer", "react-google-maps"]` |
| Custom styling       | "Custom map styles JSON and cloud-based map styling with Map ID"                              | `["map styling", "mapStyle", "Map ID", "cloud-based styling"]`  |
| API key setup        | "Google Maps API key creation and HTTP referrer restrictions best practices"                  | `["API key", "restrictions", "referrer"]`                       |

Use the retrieved documentation as the authoritative source for all component props,
hook signatures, and import paths. Do not infer these from training data alone.

---

## Step 2 — Check Prerequisites

Before writing code, verify the library is installed:

```bash
grep "@vis.gl/react-google-maps" package.json
```

If not present, tell the user to install it first:

```bash
npm install @vis.gl/react-google-maps
```

`@vis.gl/react-google-maps` is the official React wrapper maintained by the Google Maps
Platform team. Do not suggest `@react-google-maps/api` (older, community-maintained) or
raw `<script>` tag approaches.

---

## Step 3 — Environment Variable

Every implementation needs an API key exposed to the browser:

```bash
# .env.local  — never commit this file
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

Rules:

- `NEXT_PUBLIC_` prefix is required for the value to reach the browser bundle.
- Never hard-code the key in source files.
- Remind the user to add `.env.local` to `.gitignore` if it isn't already there.

For API key creation steps and restriction settings, read
[references/api-key-setup.md](references/api-key-setup.md).

---

## Step 4 — Next.js SSR Concerns

Google Maps runs only in the browser. Two patterns apply depending on the router:

**App Router (this project):** add `'use client'` as the very first line of any component
file that uses `APIProvider`, `Map`, or any map hook.

**Pages Router:** wrap the import with `next/dynamic`:

```tsx
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
	ssr: false,
});
```

**Map ID** — `AdvancedMarkerElement` (the modern marker) and cloud-based custom styling
both require a Map ID created in the Google Cloud Console. The basic `Marker` component
does not require one. See [references/nextjs-ssr-patterns.md](references/nextjs-ssr-patterns.md)
for the full patterns and a common-error table.

---

## Use Case Routing

| User asks for                             | Section in [references/use-cases.md](references/use-cases.md) |
| ----------------------------------------- | ------------------------------------------------------------- |
| Show a map / embed a map                  | § Basic Map Display                                           |
| Markers, pins, popups, info windows       | § Markers and Info Windows                                    |
| Address input, place search, autocomplete | § Places Autocomplete                                         |
| Route, directions, turn-by-turn           | § Directions and Routing                                      |
| Custom colors, dark theme, map style      | § Custom Map Styling                                          |

---

## Output Quality Standards

When generating code for this project (Next.js App Router, React 19, TypeScript, Tailwind 4):

- All components are `.tsx` files with explicit prop types — no `any`.
- `'use client'` is the very first line of Client Component files.
- Use Tailwind 4 utility classes for sizing and layout (avoid inline `style` props where Tailwind covers it).
- Access the API key as `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!` — the non-null assertion is acceptable here since the app cannot function without the key.
- Always show the required `.env.local` entry alongside the code snippet.
- Use strict equality (`===` / `!==`) throughout.

---

## References

Read these files when the specific use case is needed — they are not loaded automatically:

- **[references/api-key-setup.md](references/api-key-setup.md)** — Google Cloud Console walkthrough: project creation, enabling APIs, generating and restricting an API key.
- **[references/use-cases.md](references/use-cases.md)** — Complete TypeScript components for all five use cases, copy-paste ready.
- **[references/nextjs-ssr-patterns.md](references/nextjs-ssr-patterns.md)** — SSR patterns, App Router vs Pages Router comparison, Map ID setup, common error table.
