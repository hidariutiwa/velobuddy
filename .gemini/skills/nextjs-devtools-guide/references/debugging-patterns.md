# Debugging Patterns

## Table of Contents

- [Debugging Workflow](#debugging-workflow)
- [Using DevTools MCP for Diagnostics](#using-devtools-mcp-for-diagnostics)
- [Common Errors and Solutions](#common-errors-and-solutions)
- [Browser-Based Debugging](#browser-based-debugging)

## Debugging Workflow

Follow this sequence when debugging Next.js issues:

```
1. nextjs_index()              → Discover running dev server
2. nextjs_call(get_errors)     → Check compilation/runtime errors
3. browser_eval(navigate)      → Load the problem page
4. browser_eval(console_messages) → Check browser console
5. nextjs_docs(relevant_api)   → Verify correct API usage
```

## Using DevTools MCP for Diagnostics

### Step 1: Discover the Server

```
nextjs_index()
// or with specific port:
nextjs_index({ port: "3000" })
```

Returns available tools like `get_errors`, `get_routes`, `clear_cache`, etc.

### Step 2: Get Errors

```
nextjs_call({ port: "3000", toolName: "get_errors" })
```

### Step 3: List Routes

```
nextjs_call({ port: "3000", toolName: "get_routes" })
```

### Step 4: Clear Cache (if needed)

```
nextjs_call({ port: "3000", toolName: "clear_cache" })
```

## Common Errors and Solutions

### "params" or "searchParams" is not awaited

**Error:** `Error: Route ... used params.id. params should be awaited before using its properties.`

**Cause:** In Next.js 16+, `params` and `searchParams` are `Promise` types.

**Fix:**

```tsx
// BEFORE (broken in Next.js 16+)
export default function Page({ params }: { params: { id: string } }) {
	return <div>{params.id}</div>;
}

// AFTER
export default async function Page({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	return <div>{id}</div>;
}
```

### "use client" component tries to use async/await

**Error:** `Error: async/await is not yet supported in Client Components`

**Fix:** Move data fetching to a Server Component parent and pass data as props.

```tsx
// Server Component (parent)
export default async function Page() {
	const data = await fetchData();
	return <ClientComponent data={data} />;
}

// Client Component (child)
("use client");
export function ClientComponent({ data }: { data: DataType }) {
	const [state, setState] = useState(data);
	// ...
}
```

### Server Component imports Client-only code

**Error:** `Error: useState/useEffect only works in Client Components`

**Fix:** Add `"use client"` directive to the component that uses hooks, or extract interactive parts into a separate Client Component.

### Hydration mismatch

**Error:** `Hydration failed because the server rendered HTML didn't match the client.`

**Common causes:**

- Using `Date.now()` or `Math.random()` in Server Components
- Browser extensions modifying the DOM
- Conditional rendering based on `typeof window`

**Fix:** Use `useEffect` for client-only values, or wrap in `<Suspense>`.

### "Cannot read properties of undefined" in route handler

**Error:** `TypeError: Cannot read properties of undefined (reading 'id')`

**Cause:** Forgot to await `params` in route handler.

**Fix:**

```tsx
// BEFORE
export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const id = params.id; // undefined in Next.js 16+
}

// AFTER
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
}
```

### Module not found errors

**Error:** `Module not found: Can't resolve '...'`

**Diagnosis:**

1. Check if the import path is correct
2. Verify the file exists at the expected location
3. Check `tsconfig.json` path aliases
4. Verify the dependency is installed in `package.json`

### Server Action errors

**Error:** `Error: Only Server Components can use "use server"`

**Fix:** Server Actions must be defined in:

- A separate file with `"use server"` at the top, OR
- Inline inside a Server Component function body

```tsx
// Option 1: Separate file
// app/actions.ts
"use server";
export async function myAction() {
	/* ... */
}

// Option 2: Inline (Server Component only)
export default function Page() {
	async function myAction() {
		"use server";
		// ...
	}
	return <form action={myAction}>...</form>;
}
```

### CORS errors with Route Handlers

**Fix:** Add CORS headers:

```tsx
export async function GET() {
	return NextResponse.json(data, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		},
	});
}
```

## Browser-Based Debugging

### Navigate and Check

```
browser_eval({ action: "navigate", url: "http://localhost:3000/page" })
browser_eval({ action: "console_messages" })
browser_eval({ action: "screenshot" })
```

### Evaluate JavaScript

```
browser_eval({
  action: "evaluate",
  script: "document.querySelectorAll('[data-testid]').length"
})
```

### Check Network Requests

Use Playwright's `browser_network_requests` to inspect API calls and their responses.
