"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
	href: string;
	label: string;
}

function MapIcon() {
	return (
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
			<path
				d="M10 2C7.24 2 5 4.24 5 7C5 10.75 10 18 10 18C10 18 15 10.75 15 7C15 4.24 12.76 2 10 2ZM10 9C8.9 9 8 8.1 8 7C8 5.9 8.9 5 10 5C11.1 5 12 5.9 12 7C12 8.1 11.1 9 10 9Z"
				fill="currentColor"
			/>
		</svg>
	);
}

function ListIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
		>
			<path d="M3 5H17M3 10H17M3 15H17" />
		</svg>
	);
}

function HeartIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
		>
			<path d="M10 17C10 17 2 12.5 2 7.5C2 5.01 4.01 3 6.5 3C7.96 3 9.26 3.69 10 4.76C10.74 3.69 12.04 3 13.5 3C15.99 3 18 5.01 18 7.5C18 12.5 10 17 10 17Z" />
		</svg>
	);
}

function PersonIcon() {
	return (
		<svg
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
		>
			<circle cx="10" cy="7" r="3" />
			<path d="M4 18C4 14.69 6.69 12 10 12C13.31 12 16 14.69 16 18" />
		</svg>
	);
}

const navItems: NavItem[] = [
	{ href: "/", label: "マップ" },
	{ href: "/spots", label: "一覧" },
	{ href: "/favorites", label: "お気に入り" },
	{ href: "/profile", label: "プロフィール" },
];

const navIcons = [MapIcon, ListIcon, HeartIcon, PersonIcon];

export default function Navigation() {
	const pathname = usePathname();

	return (
		<nav className="fixed right-0 bottom-0 left-0 z-50 flex justify-center bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.08)]">
			<div className="flex h-20 w-full max-w-[390px] items-start justify-around px-2 pt-2">
				{navItems.map((item, i) => {
					const isActive = pathname === item.href;
					const Icon = navIcons[i];
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex flex-col items-center gap-0.5 ${isActive ? "text-blue-600" : "text-zinc-400"}`}
						>
							<div
								className={`flex h-7 w-9 items-center justify-center rounded-lg ${isActive ? "bg-blue-50" : ""}`}
							>
								<Icon />
							</div>
							<span
								className={`text-[9px] ${isActive ? "font-bold" : "font-normal"}`}
							>
								{item.label}
							</span>
						</Link>
					);
				})}
			</div>
		</nav>
	);
}
