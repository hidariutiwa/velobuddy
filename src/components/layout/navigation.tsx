"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { FaSearch } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { FaMapLocationDot } from "react-icons/fa6";
import { MdDirectionsBike } from "react-icons/md";

interface NavItem {
	href: string;
	label: string;
	icon: React.ReactNode;
}

const navItems: NavItem[] = [
	{ href: "/", label: "マップ", icon: <FaMapLocationDot /> },
	{ href: "/places", label: "探す", icon: <FaSearch /> },
	{
		href: "/activities",
		label: "アクティビティ",
		icon: <MdDirectionsBike />,
	},
	{ href: "/profile", label: "プロフィール", icon: <FaUser /> },
];

function NavigationItem({
	item,
	pathname,
}: {
	item: NavItem;
	pathname: string;
}) {
	const isActive = item.href === pathname;

	return (
		<Link
			href={item.href}
			className={`flex h-16 w-26 flex-col items-center justify-center px-2 py-1 ${isActive ? "text-blue-600" : ""}`}
		>
			<div
				className={`flex h-full w-3/4 items-center justify-center rounded-md text-2xl ${isActive ? "bg-blue-100" : ""}`}
			>
				{item.icon}
			</div>
			<p className="text-xs">{item.label}</p>
		</Link>
	);
}

export default function Navigation() {
	const pathname = usePathname();

	const items = navItems.map((item, index) => {
		return <NavigationItem key={index} item={item} pathname={pathname} />;
	});

	return (
		<nav className="flex h-fit w-full items-center justify-between border-t border-zinc-200 pb-6">
			<div className="flex h-fit w-full items-center justify-between">
				{items}
			</div>
		</nav>
	);
}
