"use client";

import { Header } from "@/components/layout/header";
import Navigation from "@/components/layout/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function ProfilePage() {
	const { data: session } = useSession();

	const userName = session?.user?.name ?? "田中 太郎";
	const userInitial = userName[0] ?? "U";

	return (
		<div className="mx-auto flex h-screen max-w-[390px] flex-col bg-white">
			<Header variant="page" title="プロフィール" />

			{/* Profile Card */}
			<div className="flex flex-col items-center gap-3 bg-white px-5 py-6">
				<div className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-blue-400">
					<span className="text-3xl font-bold text-white">
						{userInitial}
					</span>
				</div>
				<p className="text-xl font-bold text-zinc-900">{userName}</p>
				<p className="text-sm text-zinc-500">週末サイクリスト 🚴</p>
				<button className="flex h-9 w-[140px] items-center justify-center rounded-full border-[1.5px] border-blue-600 text-xs text-blue-600">
					プロフィールを編集
				</button>
			</div>

			{/* Stats Row */}
			<div className="flex h-[88px] items-center bg-blue-50">
				<div className="flex flex-1 flex-col items-center gap-1">
					<p className="text-[22px] font-bold text-blue-600">28</p>
					<p className="text-[11px] text-zinc-500">ライド数</p>
				</div>
				<div className="h-10 w-px bg-blue-200" />
				<div className="flex flex-1 flex-col items-center gap-1">
					<p className="text-[22px] font-bold text-blue-600">342km</p>
					<p className="text-[11px] text-zinc-500">走行距離</p>
				</div>
				<div className="h-10 w-px bg-blue-200" />
				<div className="flex flex-1 flex-col items-center gap-1">
					<p className="text-[22px] font-bold text-blue-600">15</p>
					<p className="text-[11px] text-zinc-500">お気に入り</p>
				</div>
			</div>

			{/* Menu section header */}
			<div className="flex h-9 items-center bg-zinc-100 px-5">
				<p className="text-[11px] font-bold tracking-widest text-zinc-500">
					メニュー
				</p>
			</div>

			{/* Menu List */}
			<div className="flex flex-col bg-white">
				<Link
					href="#"
					className="flex h-14 items-center gap-3.5 border-b border-zinc-100 px-5"
				>
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
						<span className="text-sm text-blue-600">▶</span>
					</div>
					<p className="flex-1 text-[15px] text-zinc-900">
						マイルート
					</p>
					<span className="text-xl text-zinc-300">›</span>
				</Link>
				<Link
					href="/favorites"
					className="flex h-14 items-center gap-3.5 border-b border-zinc-100 px-5"
				>
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
						<span className="text-base text-blue-600">♥</span>
					</div>
					<p className="flex-1 text-[15px] text-zinc-900">
						お気に入りスポット
					</p>
					<span className="text-xl text-zinc-300">›</span>
				</Link>
				<Link
					href="#"
					className="flex h-14 items-center gap-3.5 border-b border-zinc-100 px-5"
				>
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
						<span className="text-lg text-blue-600">≡</span>
					</div>
					<p className="flex-1 text-[15px] text-zinc-900">設定</p>
					<span className="text-xl text-zinc-300">›</span>
				</Link>
				<button
					onClick={() => signOut()}
					className="flex h-14 w-full items-center gap-3.5 px-5"
				>
					<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
						<span className="text-[9px] font-bold text-red-600">
							OUT
						</span>
					</div>
					<p className="flex-1 text-left text-[15px] text-red-600">
						ログアウト
					</p>
					<span className="text-xl text-zinc-300">›</span>
				</button>
			</div>

			<Navigation />
		</div>
	);
}
