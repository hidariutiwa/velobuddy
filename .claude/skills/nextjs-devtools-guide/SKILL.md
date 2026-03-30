---
name: nextjs-devtools-guide
description: >
    Guide for designing, implementing, and debugging Next.js applications using Next.js DevTools MCP
    and official documentation. Use this skill when:
    (1) Creating or modifying Next.js pages, layouts, components, or route handlers,
    (2) Implementing data fetching, caching, Server Actions, or Server/Client Components,
    (3) Debugging Next.js compilation errors, runtime errors, or routing issues,
    (4) Investigating the running Next.js dev server state (routes, errors, build status),
    (5) Any design or implementation question about Next.js App Router (v16+).
    Always consult official docs via nextjs_docs MCP tool before relying on pre-existing knowledge,
    as Next.js APIs evolve rapidly across versions.
---

# Next.js DevTools Guide

## Core Principle: Docs-First

**ALWAYS** use the `nextjs_docs` MCP tool to verify APIs, patterns, and conventions before writing code. Next.js APIs change significantly between versions.

**Workflow:**

1. Read the `nextjs-docs://llms-index` MCP resource to find the correct documentation path
2. Call `nextjs_docs({ path: "/docs/app/..." })` with the exact path from the index
3. Implement based on the verified documentation

## Available MCP Tools

| Tool                      | Purpose                                                         |
| ------------------------- | --------------------------------------------------------------- |
| `nextjs_docs`             | Fetch official Next.js documentation by path                    |
| `nextjs_index`            | Discover running dev servers and their MCP tools                |
| `nextjs_call`             | Call a specific MCP tool on a running dev server                |
| `browser_eval`            | Test pages in a real browser (screenshots, console, evaluation) |
| `upgrade_nextjs_16`       | Guide through upgrading to Next.js 16                           |
| `enable_cache_components` | Migrate to Cache Components mode                                |

## Workflow by Phase

### 1. Design Phase

Before writing code, verify the correct pattern in official docs:

1. **Identify the feature** — Page, layout, API route, data fetching, form, etc.
2. **Check docs** — Read the relevant docs section via `nextjs_docs`
3. **Inspect running app** — Use `nextjs_index` + `nextjs_call` to check existing routes and state
4. **Choose rendering strategy** — Server Component (default), Client Component (`"use client"`), or Cache Component (`"use cache"`)

For detailed patterns by feature area, see [references/app-router-patterns.md](references/app-router-patterns.md).

### 2. Implementation Phase

Follow this order:

1. **Verify docs** for the specific API/pattern being used
2. **Check existing code** in the project for established patterns
3. **Inspect dev server** with `nextjs_index` to understand current route structure
4. **Implement** following Next.js file conventions
5. **Verify** with `browser_eval` to test the page renders correctly

Key rules:

- Default to Server Components — only add `"use client"` when needed (event handlers, hooks, browser APIs)
- Use `async` for Server Components that fetch data
- Use Server Actions (`"use server"`) for mutations
- Follow file conventions: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`
- Params and searchParams are `Promise` types in Next.js 16+ — always `await` them

When unsure about an API:

```
nextjs_docs({ path: "/docs/app/api-reference/functions/cookies" })
```

### 3. Debugging Phase

When encountering errors:

1. **Check dev server errors** — `nextjs_index` to discover server, then `nextjs_call` with error diagnostic tools
2. **Check browser** — `browser_eval` with `console_messages` action to get client-side errors
3. **Search docs** — `nextjs_docs` for the relevant API to verify correct usage
4. **Verify route structure** — `nextjs_call` to list all routes and check for conflicts

For common error patterns and solutions, see [references/debugging-patterns.md](references/debugging-patterns.md).

### 4. Verification Phase

After implementing changes:

1. **Load the page** — `browser_eval` with `navigate` action
2. **Check for errors** — `nextjs_call` to get compilation/runtime errors
3. **Take screenshot** — `browser_eval` with `screenshot` action to visually verify
4. **Check console** — `browser_eval` with `console_messages` to catch warnings

## Quick Reference: File Conventions

```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx            # Home page
├── loading.tsx         # Loading UI (Suspense boundary)
├── error.tsx           # Error boundary (must be "use client")
├── not-found.tsx       # 404 page
├── global-error.tsx    # Global error boundary
├── route.ts            # API route handler
├── [slug]/
│   └── page.tsx        # Dynamic route
├── (group)/            # Route group (no URL impact)
│   └── page.tsx
└── @modal/             # Parallel route (named slot)
    └── page.tsx
```

## Quick Reference: Common Patterns

### Server Component (default)

```tsx
// app/users/page.tsx
export default async function UsersPage() {
	const users = await fetchUsers();
	return <UserList users={users} />;
}
```

### Client Component

```tsx
// app/components/counter.tsx
"use client";

import { useState } from "react";

export function Counter() {
	const [count, setCount] = useState(0);
	return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Server Action

```tsx
// app/actions.ts
"use server";

export async function createUser(formData: FormData) {
	const name = formData.get("name") as string;
	await db.user.create({ data: { name } });
	revalidatePath("/users");
}
```

### Dynamic Route with Params (Next.js 16+)

```tsx
// app/users/[id]/page.tsx
export default async function UserPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const user = await fetchUser(id);
	return <UserProfile user={user} />;
}
```
