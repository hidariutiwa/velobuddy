import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 390, height: 844 };

const SAMPLE_PROFILE = {
	id: 1,
	nickname: "テストユーザー",
	birthday: "1990-06-15T00:00:00.000Z",
	sex: 1,
};

test.describe("プロフィール編集ページ (/profile/edit)", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(MOBILE_VIEWPORT);

		// next-auth セッションをモック
		await page.route("**/api/auth/session", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					user: { name: "テストユーザー", email: "test@example.com" },
					expires: "2099-01-01",
				}),
			});
		});

		// GET /api/users/profile をモック
		await page.route("**/api/users/profile", async (route) => {
			if (route.request().method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(SAMPLE_PROFILE),
				});
			} else {
				await route.continue();
			}
		});

		await page.goto("/profile/edit");
	});

	test.describe("ページ構造", () => {
		test("ヘッダーに「プロフィール編集」タイトルが表示される", async ({
			page,
		}) => {
			await page.waitForSelector("text=プロフィール編集");
			const title = page.locator("text=プロフィール編集");
			await expect(title).toBeVisible();
		});

		test("ヘッダーに戻るボタン（←）が表示される", async ({ page }) => {
			await page.waitForSelector('[aria-label="戻る"]');
			const backButton = page.locator('[aria-label="戻る"]');
			await expect(backButton).toBeVisible();
			await expect(backButton.locator("text=←")).toBeVisible();
		});

		test("フォームが表示される（ローディング完了後）", async ({ page }) => {
			// 読み込み中が消えてフォームが表示されるまで待つ
			await page.waitForSelector("form");
			const form = page.locator("form");
			await expect(form).toBeVisible();
		});
	});

	test.describe("フォームの初期値", () => {
		test.beforeEach(async ({ page }) => {
			await page.waitForSelector("form");
		});

		test("ニックネームフィールドにAPIから取得した値が入力されている", async ({
			page,
		}) => {
			const nicknameInput = page.locator("#nickname");
			await expect(nicknameInput).toHaveValue(SAMPLE_PROFILE.nickname);
		});

		test("誕生日フィールドにAPIから取得した値が入力されている", async ({
			page,
		}) => {
			const birthdayInput = page.locator("#birthday");
			// ISO文字列の先頭10文字が date input の値になる
			await expect(birthdayInput).toHaveValue("1990-06-15");
		});

		test("性別セレクトにAPIから取得した値が選択されている", async ({
			page,
		}) => {
			const sexSelect = page.locator("#sex");
			// sex: 1 → 男性
			await expect(sexSelect).toHaveValue("1");
		});
	});

	test.describe("フォームのラベルと必須マーク", () => {
		test.beforeEach(async ({ page }) => {
			await page.waitForSelector("form");
		});

		test("「ニックネーム」ラベルと必須マーク（*）が表示される", async ({
			page,
		}) => {
			const label = page.locator('label[for="nickname"]');
			await expect(label).toContainText("ニックネーム");
			await expect(label).toContainText("*");
		});

		test("「誕生日」ラベルが表示される", async ({ page }) => {
			const label = page.locator('label[for="birthday"]');
			await expect(label).toContainText("誕生日");
		});

		test("「性別」ラベルが表示される", async ({ page }) => {
			const label = page.locator('label[for="sex"]');
			await expect(label).toContainText("性別");
		});

		test("性別セレクトに「未選択」「男性」「女性」「その他」の選択肢がある", async ({
			page,
		}) => {
			const sexSelect = page.locator("#sex");
			await expect(sexSelect.locator("option")).toHaveCount(4);
			await expect(sexSelect.locator('option[value=""]')).toContainText(
				"未選択",
			);
			await expect(sexSelect.locator('option[value="1"]')).toContainText(
				"男性",
			);
			await expect(sexSelect.locator('option[value="2"]')).toContainText(
				"女性",
			);
			await expect(sexSelect.locator('option[value="3"]')).toContainText(
				"その他",
			);
		});
	});

	test.describe("フォームの送信", () => {
		test("フォームを入力して送信すると PATCH リクエストが送られ /profile へ遷移する", async ({
			page,
		}) => {
			await page.waitForSelector("form");

			// PATCH /api/users/profile をモック（成功レスポンス）
			let patchRequestBody: unknown = null;
			await page.route("**/api/users/profile", async (route) => {
				if (route.request().method() === "PATCH") {
					patchRequestBody = JSON.parse(
						route.request().postData() ?? "{}",
					);
					await route.fulfill({
						status: 200,
						contentType: "application/json",
						body: JSON.stringify({ success: true }),
					});
				} else {
					await route.continue();
				}
			});

			// ニックネームを変更
			const nicknameInput = page.locator("#nickname");
			await nicknameInput.clear();
			await nicknameInput.fill("新しいニックネーム");

			// 誕生日を変更
			const birthdayInput = page.locator("#birthday");
			await birthdayInput.fill("2000-01-01");

			// 性別を変更
			const sexSelect = page.locator("#sex");
			await sexSelect.selectOption("2");

			// 送信ボタンをクリック
			const submitButton = page.locator('button[type="submit"]');
			await expect(submitButton).toContainText("保存する");
			await submitButton.click();

			// /profile へ遷移することを確認
			await page.waitForURL("**/profile");
			expect(page.url()).toContain("/profile");

			// PATCH リクエストのボディを検証
			expect(patchRequestBody).toMatchObject({
				nickname: "新しいニックネーム",
				birthday: "2000-01-01",
				sex: 2,
			});
		});

		test("送信中は「保存中...」と表示されボタンが無効化される", async ({
			page,
		}) => {
			await page.waitForSelector("form");

			// 遅延付きの PATCH モック
			await page.route("**/api/users/profile", async (route) => {
				if (route.request().method() === "PATCH") {
					await new Promise((resolve) => setTimeout(resolve, 500));
					await route.fulfill({
						status: 200,
						contentType: "application/json",
						body: JSON.stringify({ success: true }),
					});
				} else {
					await route.continue();
				}
			});

			const submitButton = page.locator('button[type="submit"]');
			await submitButton.click();

			// 送信中の状態を確認
			await expect(submitButton).toContainText("保存中...");
			await expect(submitButton).toBeDisabled();
		});
	});

	test.describe("エラー状態", () => {
		test("APIのGETが失敗した場合にエラーメッセージが表示される", async ({
			page,
		}) => {
			// GET をエラーにするためページ遷移前にルートを上書き
			await page.route("**/api/users/profile", async (route) => {
				if (route.request().method() === "GET") {
					await route.fulfill({
						status: 500,
						contentType: "application/json",
						body: JSON.stringify({
							error: "Internal Server Error",
						}),
					});
				} else {
					await route.continue();
				}
			});

			// エラーメッセージが表示されるまで待つ
			await page.waitForSelector("text=プロフィールの取得に失敗しました");
			const errorMessage = page.locator(
				"text=プロフィールの取得に失敗しました",
			);
			await expect(errorMessage).toBeVisible();
		});

		test("PATCHが失敗した場合にエラーメッセージが表示される", async ({
			page,
		}) => {
			await page.waitForSelector("form");

			// PATCH をエラーにする
			await page.route("**/api/users/profile", async (route) => {
				if (route.request().method() === "PATCH") {
					await route.fulfill({
						status: 500,
						contentType: "application/json",
						body: JSON.stringify({
							error: "Internal Server Error",
						}),
					});
				} else {
					await route.continue();
				}
			});

			const submitButton = page.locator('button[type="submit"]');
			await submitButton.click();

			await page.waitForSelector("text=プロフィールの更新に失敗しました");
			const errorMessage = page.locator(
				"text=プロフィールの更新に失敗しました",
			);
			await expect(errorMessage).toBeVisible();
		});
	});

	test.describe("ローディング状態", () => {
		test("データ取得中に「読み込み中...」が表示される", async ({
			page,
		}) => {
			// GETを遅延させて読み込み中状態を確認する
			await page.route("**/api/users/profile", async (route) => {
				if (route.request().method() === "GET") {
					await new Promise((resolve) => setTimeout(resolve, 300));
					await route.fulfill({
						status: 200,
						contentType: "application/json",
						body: JSON.stringify(SAMPLE_PROFILE),
					});
				} else {
					await route.continue();
				}
			});

			// ページに遷移する前にルートを設定済みなので、遷移後すぐに確認
			await page.goto("/profile/edit");
			const loadingText = page.locator("text=読み込み中...");
			await expect(loadingText).toBeVisible();

			// ローディングが終わったらフォームが表示される
			await page.waitForSelector("form");
			await expect(loadingText).not.toBeVisible();
		});
	});
});
