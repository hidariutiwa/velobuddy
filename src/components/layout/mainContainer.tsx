import React from "react";

export default function MainContainer({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div className="h-full w-full bg-blue-50">{children}</div>;
}
