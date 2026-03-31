"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

function GoogleLoginButton() {
	const { status } = useSession();
	if (status !== "unauthenticated") return null;
	return (
		<button
			onClick={() => signIn("google")}
			className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-bold text-blue-500"
		>
			G
		</button>
	);
}

function UserAvatar() {
	const { data: session, status } = useSession();
	if (status !== "authenticated") return null;
	return (
		<div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
			<span className="text-sm font-bold text-blue-600">
				{session?.user?.name?.[0] ?? "U"}
			</span>
		</div>
	);
}

export default function Header() {
	return (
		<header className="flex h-fit w-full items-center justify-between border-b border-zinc-200 bg-white px-4 py-4">
			<Link href="/" className="text-xl font-bold text-blue-600">
				Velobuddy
			</Link>
			<div className="flex items-center gap-2">
				<GoogleLoginButton />
				<UserAvatar />
			</div>
		</header>
	);
}
