# App Router Patterns

## Table of Contents

- [Rendering Strategy Selection](#rendering-strategy-selection)
- [Data Fetching](#data-fetching)
- [Forms and Mutations](#forms-and-mutations)
- [Layouts and Templates](#layouts-and-templates)
- [Route Handlers (API)](#route-handlers-api)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Loading States](#loading-states)
- [Metadata](#metadata)
- [Caching and Revalidation](#caching-and-revalidation)

## Rendering Strategy Selection

Use this decision tree to choose the correct component type:

```
Does the component need...
├── Event handlers (onClick, onChange, onSubmit)?  → "use client"
├── React hooks (useState, useEffect, useRef)?     → "use client"
├── Browser APIs (window, document, localStorage)? → "use client"
├── None of the above?                             → Server Component (default)
└── Caching with static output?                    → "use cache" (Next.js 16+)
```

**Key principle:** Keep Client Components at the leaf level. Push `"use client"` boundaries as low as possible in the component tree.

```tsx
// GOOD: Only the interactive part is a Client Component
// app/posts/page.tsx (Server Component)
export default async function PostsPage() {
	const posts = await fetchPosts();
	return (
		<div>
			<h1>Posts</h1>
			{posts.map((post) => (
				<PostCard key={post.id} post={post} />
			))}
			<LikeButton /> {/* Only this is "use client" */}
		</div>
	);
}
```

## Data Fetching

### Server Component Data Fetching

Fetch data directly in Server Components using `async/await`:

```tsx
// app/dashboard/page.tsx
export default async function DashboardPage() {
	const data = await fetch("https://api.example.com/data");
	const json = await data.json();
	return <Dashboard data={json} />;
}
```

### Parallel Data Fetching

Use `Promise.all` to fetch data in parallel:

```tsx
export default async function Page() {
	const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);
	return (
		<>
			<UserList users={users} />
			<PostList posts={posts} />
		</>
	);
}
```

### Streaming with Suspense

Wrap slow data fetches in Suspense for streaming:

```tsx
import { Suspense } from "react";

export default function Page() {
	return (
		<div>
			<h1>Dashboard</h1>
			<Suspense fallback={<Loading />}>
				<SlowComponent />
			</Suspense>
		</div>
	);
}
```

## Forms and Mutations

### Server Action with Form

```tsx
// app/create/page.tsx
import { createItem } from "./actions";

export default function CreatePage() {
	return (
		<form action={createItem}>
			<input name="title" type="text" required />
			<button type="submit">Create</button>
		</form>
	);
}
```

```tsx
// app/create/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createItem(formData: FormData) {
	const title = formData.get("title") as string;
	await db.item.create({ data: { title } });
	revalidatePath("/items");
	redirect("/items");
}
```

### Client-Side Form with useActionState

```tsx
"use client";

import { submitForm } from "./actions";
import { useActionState } from "react";

export function ContactForm() {
	const [state, action, isPending] = useActionState(submitForm, null);

	return (
		<form action={action}>
			<input name="email" type="email" />
			{state?.error && <p>{state.error}</p>}
			<button disabled={isPending}>
				{isPending ? "Sending..." : "Send"}
			</button>
		</form>
	);
}
```

## Layouts and Templates

### Shared Layout

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div>
			<nav>
				<DashboardNav />
			</nav>
			<main>{children}</main>
		</div>
	);
}
```

### Template (re-renders on navigation)

```tsx
// app/dashboard/template.tsx
export default function DashboardTemplate({
	children,
}: {
	children: React.ReactNode;
}) {
	// Re-renders on every navigation (unlike layout)
	return <div>{children}</div>;
}
```

## Route Handlers (API)

### GET Handler

```tsx
// app/api/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
	const users = await db.user.findMany();
	return NextResponse.json(users);
}
```

### Dynamic Route Handler

```tsx
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const user = await db.user.findUnique({ where: { id } });
	if (!user) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}
	return NextResponse.json(user);
}
```

### POST Handler with Validation

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	const body = await request.json();
	const user = await db.user.create({ data: body });
	return NextResponse.json(user, { status: 201 });
}
```

## Middleware

```tsx
// middleware.ts (project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	// Check auth, redirect, rewrite, etc.
	const token = request.cookies.get("token");
	if (!token) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

## Error Handling

### Error Boundary

```tsx
// app/dashboard/error.tsx
"use client";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div>
			<h2>Something went wrong</h2>
			<button onClick={() => reset()}>Try again</button>
		</div>
	);
}
```

### Not Found

```tsx
// app/users/[id]/not-found.tsx
export default function NotFound() {
	return <div>User not found</div>;
}
```

```tsx
// app/users/[id]/page.tsx
import { notFound } from "next/navigation";

export default async function UserPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const user = await fetchUser(id);
	if (!user) notFound();
	return <UserProfile user={user} />;
}
```

## Loading States

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
	return <div>Loading...</div>;
}
```

## Metadata

### Static Metadata

```tsx
// app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "About Us",
	description: "Learn more about our company",
};
```

### Dynamic Metadata

```tsx
// app/users/[id]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const user = await fetchUser(id);
	return { title: user.name };
}
```

## Caching and Revalidation

### Time-Based Revalidation

```tsx
// Revalidate every 60 seconds
const data = await fetch("https://api.example.com/data", {
	next: { revalidate: 60 },
});
```

### On-Demand Revalidation

```tsx
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";

export async function updateData() {
	await db.data.update(/* ... */);
	revalidatePath("/dashboard"); // Revalidate specific path
	revalidateTag("data"); // Revalidate by tag
}
```

### Cache Tags

```tsx
const data = await fetch("https://api.example.com/data", {
	next: { tags: ["data"] },
});
```
