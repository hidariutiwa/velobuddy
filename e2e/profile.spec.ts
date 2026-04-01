import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 390, height: 844 };

test.describe("プロフィールページ", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(MOBILE_VIEWPORT);
	});

	test.describe("未認証状態（セッションなし）", () => {
		test.beforeEach(async ({ page }) => {
			await page.route("**/api/auth/session", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({}),
				});
			});
		});

		test("ページが表示される", async ({ page }) => {
			await page.goto("/profile");
			await expect(page).toHaveURL("/profile");
		});

		test("デフォルトユーザー名「田中 太郎」が表示される", async ({
			page,
		}) => {
			await page.goto("/profile");
			await expect(
				page.locator("p", { hasText: "田中 太郎" }),
			).toBeVisible();
		});

		test("デフォルトユーザーのイニシャル「田」がアバターに表示される", async ({
			page,
		}) => {
			await page.goto("/profile");
			// ユーザー名「田中 太郎」の最初の文字「田」がアバターに表示される
			await expect(
				page.locator("span", { hasText: "田" }).first(),
			).toBeVisible();
		});

		test("サブテキスト「週末サイクリスト」が表示される", async ({
			page,
		}) => {
			await page.goto("/profile");
			await expect(
				page.locator("p", { hasText: "週末サイクリスト" }),
			).toBeVisible();
		});
	});

	test.describe("認証済み状態", () => {
		test.beforeEach(async ({ page }) => {
			await page.route("**/api/auth/session", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						user: {
							name: "山田 花子",
							email: "hanako@example.com",
						},
						expires: "2099-01-01",
					}),
				});
			});
		});

		test("ログイン中のユーザー名が表示される", async ({ page }) => {
			await page.goto("/profile");
			await expect(
				page.locator("p", { hasText: "山田 花子" }),
			).toBeVisible();
		});

		test("ユーザーのイニシャルがアバターに表示される", async ({ page }) => {
			await page.goto("/profile");
			// 「山田 花子」の最初の文字「山」がアバターに表示される
			await expect(
				page.locator("span", { hasText: "山" }).first(),
			).toBeVisible();
		});
	});

	test.describe("統計セクション", () => {
		test.beforeEach(async ({ page }) => {
			await page.route("**/api/auth/session", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({}),
				});
			});
		});

		test("ライド数「28」が表示される", async ({ page }) => {
			await page.goto("/profile");
			await expect(page.locator("p", { hasText: "28" })).toBeVisible();
			await expect(
				page.locator("p", { hasText: "ライド数" }),
			).toBeVisible();
		});

		test("走行距離「342km」が表示される", async ({ page }) => {
			await page.goto("/profile");
			await expect(page.locator("p", { hasText: "342km" })).toBeVisible();
			await expect(
				page.locator("p", { hasText: "走行距離" }),
			).toBeVisible();
		});

		test("お気に入り数「15」が表示される", async ({ page }) => {
			await page.goto("/profile");
			await expect(page.locator("p", { hasText: "15" })).toBeVisible();
			await expect(
				page.locator("p", { hasText: "お気に入り" }).last(),
			).toBeVisible();
		});

		test("3つの統計項目がすべて表示される", async ({ page }) => {
			await page.goto("/profile");
			await expect(page.locator("p", { hasText: "28" })).toBeVisible();
			await expect(page.locator("p", { hasText: "342km" })).toBeVisible();
			await expect(page.locator("p", { hasText: "15" })).toBeVisible();
		});
	});

	test.describe("メニューセクション", () => {
		test.beforeEach(async ({ page }) => {
			await page.route("**/api/auth/session", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({}),
				});
			});
		});

		test("「メニュー」セクションヘッダーが表示される", async ({ page }) => {
			await page.goto("/profile");
			await expect(
				page.locator("p", { hasText: "メニュー" }),
			).toBeVisible();
		});

		test("「マイルート」メニュー項目が表示される", async ({ page }) => {
			await page.goto("/profile");
			await expect(
				page.locator("p", { hasText: "マイルート" }),
			).toBeVisible();
		});

		test("「お気に入りスポット」メニュー項目が表示される", async ({
			page,
		}) => {
			await page.goto("/profile");
			await expect(
				page.locator("p", { hasText: "お気に入りスポット" }),
			).toBeVisible();
		});

		test("「設定」メニュー項目が表示される", async ({ page }) => {
			await page.goto("/profile");
			await expect(page.locator("p", { hasText: "設定" })).toBeVisible();
		});

		test("「ログアウト」ボタンが表示される", async ({ page }) => {
			await page.goto("/profile");
			await expect(
				page.locator("p", { hasText: "ログアウト" }),
			).toBeVisible();
		});

		test("「お気に入りスポット」メニューは /favorites にリンクしている", async ({
			page,
		}) => {
			await page.goto("/profile");
			const favoritesLink = page.locator('a[href="/favorites"]');
			await expect(favoritesLink).toBeVisible();
			await expect(favoritesLink).toContainText("お気に入りスポット");
		});
	});

	test.describe("プロフィール編集リンク", () => {
		test.beforeEach(async ({ page }) => {
			await page.route("**/api/auth/session", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({}),
				});
			});
		});

		test("「プロフィールを編集」ボタンが表示される", async ({ page }) => {
			await page.goto("/profile");
			await expect(
				page.locator("a", { hasText: "プロフィールを編集" }),
			).toBeVisible();
		});

		test("「プロフィールを編集」リンクは /profile/edit にリンクしている", async ({
			page,
		}) => {
			await page.goto("/profile");
			const editLink = page.locator('a[href="/profile/edit"]');
			await expect(editLink).toBeVisible();
			await expect(editLink).toContainText("プロフィールを編集");
		});
	});

	test.describe("ナビゲーション", () => {
		test.beforeEach(async ({ page }) => {
			await page.route("**/api/auth/session", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({}),
				});
			});
		});

		test("「お気に入りスポット」メニューをクリックすると /favorites に遷移する", async ({
			page,
		}) => {
			await page.goto("/profile");
			await page.locator('a[href="/favorites"]').click();
			await expect(page).toHaveURL("/favorites");
		});

		test("「プロフィールを編集」をクリックすると /profile/edit に遷移する", async ({
			page,
		}) => {
			await page.goto("/profile");
			await page.locator('a[href="/profile/edit"]').click();
			await expect(page).toHaveURL("/profile/edit");
		});
	});

	test.describe("ログアウト", () => {
		test.beforeEach(async ({ page }) => {
			await page.route("**/api/auth/session", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						user: {
							name: "テストユーザー",
							email: "test@example.com",
						},
						expires: "2099-01-01",
					}),
				});
			});
		});

		test("「ログアウト」ボタンをクリックするとsignOutが呼ばれる", async ({
			page,
		}) => {
			// signOut は /api/auth/signout にリクエストを送る
			let signOutCalled = false;
			await page.route("**/api/auth/signout", async (route) => {
				signOutCalled = true;
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({ url: "http://localhost:3000" }),
				});
			});

			await page.goto("/profile");

			const logoutButton = page.locator("button", {
				hasText: "ログアウト",
			});
			await expect(logoutButton).toBeVisible();
			await logoutButton.click();

			// signOut の処理が発火したことを確認（リクエスト送信 or リダイレクト）
			await expect
				.poll(() => signOutCalled, { timeout: 5000 })
				.toBe(true);
		});
	});
});
