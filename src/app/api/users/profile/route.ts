import { authOptions } from "@/lib/auth";
import { getUserProfile, updateUserProfile } from "@/lib/db/user";
import { UpdateUserProfileInput } from "@/types/user";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
	const session = await getServerSession(authOptions);

	if (session === null) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	if (typeof userId !== "number" || Number.isNaN(userId)) {
		return NextResponse.json({ error: "Invalid user" }, { status: 401 });
	}
	const profile = await getUserProfile(userId);

	if (profile === null) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	return NextResponse.json(profile);
}

export async function PATCH(request: Request): Promise<NextResponse> {
	const session = await getServerSession(authOptions);

	if (session === null) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const userId = session.user.id;
	if (typeof userId !== "number" || Number.isNaN(userId)) {
		return NextResponse.json({ error: "Invalid user" }, { status: 401 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (typeof body !== "object" || body === null) {
		return NextResponse.json(
			{ error: "Invalid request body" },
			{ status: 400 },
		);
	}

	const raw = body as Record<string, unknown>;
	const input: UpdateUserProfileInput = {};

	if ("nickname" in raw) {
		if (typeof raw.nickname !== "string") {
			return NextResponse.json(
				{ error: "nickname must be a string" },
				{ status: 400 },
			);
		}
		input.nickname = raw.nickname;
	}

	if ("birthday" in raw) {
		if (raw.birthday !== null && typeof raw.birthday !== "string") {
			return NextResponse.json(
				{ error: "birthday must be an ISO string or null" },
				{ status: 400 },
			);
		}
		input.birthday = raw.birthday as string | null;
	}

	if ("sex" in raw) {
		if (raw.sex !== null && typeof raw.sex !== "number") {
			return NextResponse.json(
				{ error: "sex must be a number or null" },
				{ status: 400 },
			);
		}
		input.sex = raw.sex as number | null;
	}

	try {
		const updated = await updateUserProfile(userId, input);
		return NextResponse.json(updated);
	} catch {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}
}
