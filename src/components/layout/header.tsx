"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

interface HeaderProps {
	variant?: "main" | "sub" | "page";
	title?: string;
	backHref?: string;
	actionButton?: React.ReactNode;
}

function BackArrowIcon() {
	return (
		<svg
			width="16"
			height="16"
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M10 12L6 8L10 4" />
		</svg>
	);
}

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

export function Header({
	variant = "main",
	title,
	backHref = "/",
	actionButton,
}: HeaderProps) {
	if (variant === "main") {
		return (
			<header className="border-b border-zinc-200 bg-white">
				<div className="flex h-14 items-center justify-between px-5">
					<span className="text-xl font-bold text-blue-600">
						velobuddy
					</span>
					<div className="flex items-center gap-2">
						<GoogleLoginButton />
						<UserAvatar />
					</div>
				</div>
			</header>
		);
	}

	if (variant === "sub") {
		return (
			<header className="border-b border-zinc-200 bg-white">
				<div className="flex h-14 items-center justify-between px-4">
					<Link
						href={backHref}
						className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600"
					>
						<BackArrowIcon />
					</Link>
					<span className="text-[17px] font-bold text-zinc-900">
						{title}
					</span>
					<div className="flex items-center gap-2">
						{actionButton}
						<GoogleLoginButton />
						<UserAvatar />
					</div>
				</div>
			</header>
		);
	}

	// variant === "page"
	return (
		<header className="border-b border-zinc-200 bg-white">
			<div className="flex h-14 items-center justify-between px-5">
				<span className="text-[17px] font-bold text-zinc-900">
					{title}
				</span>
				<div className="flex items-center gap-2">
					<GoogleLoginButton />
					<UserAvatar />
				</div>
			</div>
		</header>
	);
}
