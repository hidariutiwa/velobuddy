"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function Header() {
	const { data: session, status } = useSession();

	return (
		<header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
			<span className="text-lg font-bold text-zinc-800">Velobuddy</span>
			<div>
				{status === "loading" && (
					<span className="text-sm text-zinc-400">読み込み中...</span>
				)}
				{status === "unauthenticated" && (
					<button
						onClick={() => signIn("google")}
						className="rounded-full bg-zinc-800 px-4 py-2 text-sm text-white"
					>
						Googleでログイン
					</button>
				)}
				{status === "authenticated" && session.user && (
					<div className="flex items-center gap-3">
						<span className="text-sm text-zinc-600">
							{session.user.name}
						</span>
						<button
							onClick={() => signOut()}
							className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-600"
						>
							ログアウト
						</button>
					</div>
				)}
			</div>
		</header>
	);
}
