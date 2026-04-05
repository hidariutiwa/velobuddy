"use client";
import { UpdateUserProfileInput, UserProfile } from "@/types/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FormState {
	nickname: string;
	birthday: string;
	sex: string;
}

interface ProfileEditFormProps {
	initialProfile: UserProfile;
}

export default function ProfileEditForm({
	initialProfile,
}: ProfileEditFormProps) {
	const router = useRouter();
	const [form, setForm] = useState<FormState>({
		nickname: initialProfile.nickname ?? "",
		birthday:
			initialProfile.birthday !== null
				? initialProfile.birthday.slice(0, 10)
				: "",
		sex:
			initialProfile.sex !== null && initialProfile.sex !== undefined
				? String(initialProfile.sex)
				: "",
	});
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");

		const body: UpdateUserProfileInput = {
			nickname: form.nickname || undefined,
			birthday: form.birthday || null,
			sex: form.sex !== "" ? Number(form.sex) : null,
		};

		try {
			const res = await fetch("/api/users/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				throw new Error("プロフィールの更新に失敗しました");
			}
			router.push("/profile");
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "プロフィールの更新に失敗しました",
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="mx-auto flex h-full w-full flex-col bg-white">
			{/* Header */}
			<div className="flex h-14 items-center gap-3 border-b border-zinc-100 px-5">
				<button
					onClick={() => router.back()}
					className="flex h-9 w-9 items-center justify-center text-zinc-700"
					aria-label="戻る"
				>
					<span className="text-xl">←</span>
				</button>
				<p className="flex-1 text-center text-base font-bold text-zinc-900">
					プロフィール編集
				</p>
				{/* spacer to center title */}
				<div className="h-9 w-9" />
			</div>

			{/* Form */}
			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-6 px-5 py-6"
			>
				{/* Error */}
				{error !== "" && (
					<p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
						{error}
					</p>
				)}

				{/* Nickname */}
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="nickname"
						className="text-sm font-bold text-zinc-700"
					>
						ニックネーム
						<span className="ml-1 text-red-500">*</span>
					</label>
					<input
						id="nickname"
						type="text"
						required
						value={form.nickname}
						onChange={(e) =>
							setForm((prev) => ({
								...prev,
								nickname: e.target.value,
							}))
						}
						className="h-11 w-full rounded-lg border border-zinc-200 px-4 text-sm text-zinc-900 outline-none focus:border-blue-600"
						placeholder="ニックネームを入力"
					/>
				</div>

				{/* Birthday */}
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="birthday"
						className="text-sm font-bold text-zinc-700"
					>
						誕生日
					</label>
					<input
						id="birthday"
						type="date"
						value={form.birthday}
						onChange={(e) =>
							setForm((prev) => ({
								...prev,
								birthday: e.target.value,
							}))
						}
						className="h-11 w-full rounded-lg border border-zinc-200 px-4 text-sm text-zinc-900 outline-none focus:border-blue-600"
					/>
				</div>

				{/* Sex */}
				<div className="flex flex-col gap-1.5">
					<label
						htmlFor="sex"
						className="text-sm font-bold text-zinc-700"
					>
						性別
					</label>
					<select
						id="sex"
						value={form.sex}
						onChange={(e) =>
							setForm((prev) => ({
								...prev,
								sex: e.target.value,
							}))
						}
						className="h-11 w-full rounded-lg border border-zinc-200 px-4 text-sm text-zinc-900 outline-none focus:border-blue-600"
					>
						<option value="">未選択</option>
						<option value="1">男性</option>
						<option value="2">女性</option>
						<option value="3">その他</option>
					</select>
				</div>

				{/* Submit */}
				<button
					type="submit"
					disabled={submitting}
					className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white disabled:opacity-50"
				>
					{submitting ? "保存中..." : "保存する"}
				</button>
			</form>
		</div>
	);
}
