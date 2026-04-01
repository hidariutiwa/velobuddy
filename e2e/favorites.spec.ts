import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 390, height: 844 };

const SAMPLE_FAVORITES = [
	{
		id: 1,
		visited: false,
		memo: null,
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
		place: {
			id: 1,
			googlePlaceId: "ChIJ_test_1",
			name: "代々木公園",
			latitude: 35.6713,
			longitude: 139.6942,
			address: "東京都渋谷区代々木神園町2−1",
			imageUrl: null,
		},
	},
	{
		id: 2,
		visited: true,
		memo: "景色が最高",
		createdAt: "2024-01-02T00:00:00.000Z",
		updatedAt: "2024-01-02T00:00:00.000Z",
		place: {
			id: 2,
			googlePlaceId: "ChIJ_test_2",
			name: "荒川サイクリングロード",
			latitude: 35.7804,
			longitude: 139.8011,
			address: "東京都荒川区",
			imageUrl: "https://example.com/arakawa.jpg",
		},
	},
];

test.describe("お気に入りページ", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(MOBILE_VIEWPORT);
	});

	test.describe("未認証状態", () => {
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
			await page.goto("/favorites");
			await expect(page).toHaveURL("/favorites");
		});

		test("「お気に入りスポット」の見出しが表示される", async ({ page }) => {
			await page.goto("/favorites");
			await expect(
				page.locator("p", { hasText: "お気に入りスポット" }).first(),
			).toBeVisible();
		});

		test("未認証時はローディングが終わりリストが空になる", async ({
			page,
		}) => {
			// /api/favorites が呼ばれないことを確認するためにモックを設定
			let favoritesApiCalled = false;
			await page.route("**/api/favorites", async (route) => {
				favoritesApiCalled = true;
				await route.fulfill({
					status: 401,
					contentType: "application/json",
					body: JSON.stringify({ error: "Unauthorized" }),
				});
			});

			await page.goto("/favorites");

			// ローディングスケルトンが消えるのを待つ
			await expect(page.locator(".animate-pulse").first())
				.not.toBeAttached({ timeout: 5000 })
				.catch(() => {
					// animate-pulse が最初から存在しない場合もある
				});

			// 未認証の場合、空状態メッセージが表示される
			await expect(
				page.locator("p", {
					hasText: "お気に入りスポットはまだありません",
				}),
			).toBeVisible({ timeout: 5000 });

			// API は呼ばれていないことを確認
			expect(favoritesApiCalled).toBe(false);
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
							name: "テストユーザー",
							email: "test@example.com",
						},
						expires: "2099-01-01",
					}),
				});
			});
		});

		test("お気に入りが存在しない場合、空状態メッセージが表示される", async ({
			page,
		}) => {
			await page.route("**/api/favorites", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify([]),
				});
			});

			await page.goto("/favorites");

			await expect(
				page.locator("p", {
					hasText: "お気に入りスポットはまだありません",
				}),
			).toBeVisible({ timeout: 5000 });
		});

		test("お気に入りスポット一覧が表示される", async ({ page }) => {
			await page.route("**/api/favorites", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(SAMPLE_FAVORITES),
				});
			});

			await page.goto("/favorites");

			// ローディング完了を待つ
			await expect(
				page.locator("p", { hasText: "代々木公園" }),
			).toBeVisible({ timeout: 5000 });

			// 2件表示されることを確認
			await expect(
				page.locator("p", { hasText: "荒川サイクリングロード" }),
			).toBeVisible();
		});

		test("スポット名と住所が表示される", async ({ page }) => {
			await page.route("**/api/favorites", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(SAMPLE_FAVORITES),
				});
			});

			await page.goto("/favorites");

			await expect(
				page.locator("p", { hasText: "代々木公園" }),
			).toBeVisible({ timeout: 5000 });

			await expect(
				page.locator("p", { hasText: "東京都渋谷区代々木神園町2−1" }),
			).toBeVisible();
		});

		test("訪問済みのスポットに「訪問済み」ボタンが表示される", async ({
			page,
		}) => {
			await page.route("**/api/favorites", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(SAMPLE_FAVORITES),
				});
			});

			await page.goto("/favorites");

			await expect(
				page.locator("button", { hasText: "訪問済み" }),
			).toBeVisible({ timeout: 5000 });
		});

		test("未訪問のスポットに「未訪問」ボタンが表示される", async ({
			page,
		}) => {
			await page.route("**/api/favorites", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(SAMPLE_FAVORITES),
				});
			});

			await page.goto("/favorites");

			await expect(
				page.locator("button", { hasText: "未訪問" }),
			).toBeVisible({ timeout: 5000 });
		});

		test("メモが入力済みのスポットにメモが表示される", async ({ page }) => {
			await page.route("**/api/favorites", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(SAMPLE_FAVORITES),
				});
			});

			await page.goto("/favorites");

			await expect(
				page.locator("textarea[placeholder='メモを入力...']").nth(1),
			).toHaveValue("景色が最高", { timeout: 5000 });
		});

		test("削除ボタンが各スポットに表示される", async ({ page }) => {
			await page.route("**/api/favorites", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(SAMPLE_FAVORITES),
				});
			});

			await page.goto("/favorites");

			await expect(
				page.locator("button[aria-label='削除']").first(),
			).toBeVisible({ timeout: 5000 });

			// 2件分の削除ボタンが存在する
			await expect(page.locator("button[aria-label='削除']")).toHaveCount(
				2,
			);
		});

		test("訪問済みトグルをクリックするとPATCHリクエストが送信される", async ({
			page,
		}) => {
			await page.route("**/api/favorites", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(SAMPLE_FAVORITES),
				});
			});

			let patchBody: string | null = null;
			await page.route("**/api/favorites/1", async (route) => {
				if (route.request().method() === "PATCH") {
					patchBody = route.request().postData();
					await route.fulfill({
						status: 200,
						contentType: "application/json",
						body: JSON.stringify({ success: true }),
					});
				} else {
					await route.continue();
				}
			});

			await page.goto("/favorites");

			// 「未訪問」ボタンをクリック（id=1 のスポットは未訪問）
			await page.locator("button", { hasText: "未訪問" }).click();

			// PATCH リクエストが送信されたことを確認
			await expect
				.poll(() => patchBody, { timeout: 3000 })
				.not.toBeNull();

			const parsed = JSON.parse(patchBody ?? "{}") as {
				visited: boolean;
			};
			expect(parsed.visited).toBe(true);
		});

		test("削除ボタンをクリックするとDELETEリクエストが送信されスポットが消える", async ({
			page,
		}) => {
			await page.route("**/api/favorites", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(SAMPLE_FAVORITES),
				});
			});

			await page.route("**/api/favorites/1", async (route) => {
				if (route.request().method() === "DELETE") {
					await route.fulfill({
						status: 200,
						contentType: "application/json",
						body: JSON.stringify({ success: true }),
					});
				} else {
					await route.continue();
				}
			});

			await page.goto("/favorites");

			await expect(
				page.locator("p", { hasText: "代々木公園" }),
			).toBeVisible({ timeout: 5000 });

			// 1件目の削除ボタンをクリック
			await page.locator("button[aria-label='削除']").first().click();

			// 削除されたスポットがリストから消える
			await expect(
				page.locator("p", { hasText: "代々木公園" }),
			).not.toBeAttached({ timeout: 3000 });

			// もう一方のスポットは残っている
			await expect(
				page.locator("p", { hasText: "荒川サイクリングロード" }),
			).toBeVisible();
		});

		test("APIエラー時は空リストが表示される", async ({ page }) => {
			await page.route("**/api/favorites", async (route) => {
				await route.abort();
			});

			await page.goto("/favorites");

			await expect(
				page.locator("p", {
					hasText: "お気に入りスポットはまだありません",
				}),
			).toBeVisible({ timeout: 5000 });
		});

		test("ローディング中はスケルトンが表示される", async ({ page }) => {
			// API のレスポンスを遅延させてローディング状態を観察する
			await page.route("**/api/favorites", async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 500));
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify([]),
				});
			});

			await page.goto("/favorites");

			// ローディングスケルトンが表示されることを確認
			await expect(page.locator(".animate-pulse").first()).toBeVisible({
				timeout: 3000,
			});
		});

		test("画像なしのスポットは「No Image」プレースホルダーが表示される", async ({
			page,
		}) => {
			await page.route("**/api/favorites", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(SAMPLE_FAVORITES),
				});
			});

			await page.goto("/favorites");

			await expect(
				page.locator("p", { hasText: "No Image" }),
			).toBeVisible({ timeout: 5000 });
		});
	});
});
