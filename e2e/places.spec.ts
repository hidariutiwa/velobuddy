import { test, expect, Page } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 390, height: 844 };

const MOCK_PLACES_RESPONSE = {
	places: [
		{
			id: 10,
			googlePlaceId: "mock-place-10",
			name: "モックカフェ渋谷店",
			latitude: 35.658,
			longitude: 139.7016,
			address: "東京都渋谷区道玄坂1-1",
			imageUrl: null,
		},
		{
			id: 11,
			googlePlaceId: "mock-place-11",
			name: "モック公園",
			latitude: 35.669,
			longitude: 139.71,
			address: "東京都渋谷区2-2-2",
			imageUrl: null,
		},
	],
};

const EMPTY_PLACES_RESPONSE = { places: [] };

// /api/places/search をモックする
async function mockPlacesSearch(
	page: Page,
	response: object = MOCK_PLACES_RESPONSE,
) {
	await page.route("**/api/places/search**", (route) => {
		return route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify(response),
		});
	});
}

test.describe("探す画面 (/places)", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(MOBILE_VIEWPORT);
		await mockPlacesSearch(page);
		await page.goto("/places");
		await page.waitForLoadState("domcontentloaded");
	});

	test.describe("初期表示", () => {
		test("ページが正常に表示される", async ({ page }) => {
			await expect(page).toHaveURL("/places");
			await expect(page.locator("div.bg-blue-50").first()).toBeVisible();
		});

		test("検索バーが表示される", async ({ page }) => {
			const searchInput = page.locator('input[placeholder="探す"]');
			await expect(searchInput).toBeVisible();
		});

		test("初期状態ではカードが表示されない", async ({ page }) => {
			// 検索前はカード一覧が空であること
			const cards = page.locator("div.rounded-md.bg-white.shadow");
			await expect(cards).toHaveCount(0);
		});
	});

	test.describe("検索機能", () => {
		test("検索ワードを入力してEnterキーで検索できる", async ({ page }) => {
			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.fill("カフェ");
			await searchInput.press("Enter");

			// カードが2件表示されること
			const cards = page.locator("div.rounded-md.bg-white.shadow");
			await expect(cards).toHaveCount(2);
		});

		test("検索結果にスポット名が表示される", async ({ page }) => {
			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.fill("カフェ");
			await searchInput.press("Enter");

			await expect(page.locator("text=モックカフェ渋谷店")).toBeVisible();
			await expect(page.locator("text=モック公園")).toBeVisible();
		});

		test("検索結果にカテゴリが表示される", async ({ page }) => {
			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.fill("公園");
			await searchInput.press("Enter");

			// PlaceCard は category を "観光" として固定で表示する（places/page.tsx の実装に合わせる）
			const categoryTexts = page.locator("p", { hasText: "観光" });
			await expect(categoryTexts.first()).toBeVisible();
		});

		test("検索結果に住所が表示される", async ({ page }) => {
			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.fill("渋谷");
			await searchInput.press("Enter");

			await expect(
				page.locator("text=東京都渋谷区道玄坂1-1"),
			).toBeVisible();
		});

		test("空のクエリではEnterキーを押してもAPIが呼ばれない", async ({
			page,
		}) => {
			let apiCalled = false;
			await page.route("**/api/places/search**", (route) => {
				apiCalled = true;
				return route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(EMPTY_PLACES_RESPONSE),
				});
			});

			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.press("Enter");
			await page.waitForTimeout(300);
			expect(apiCalled).toBe(false);
		});

		test("スペースのみ入力してEnterを押してもAPIが呼ばれない", async ({
			page,
		}) => {
			let apiCalled = false;
			await page.route("**/api/places/search**", (route) => {
				apiCalled = true;
				return route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(EMPTY_PLACES_RESPONSE),
				});
			});

			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.fill("   ");
			await searchInput.press("Enter");
			await page.waitForTimeout(300);
			expect(apiCalled).toBe(false);
		});
	});

	test.describe("検索結果なし", () => {
		test("結果が0件の場合はカードが表示されない", async ({ page }) => {
			// 空レスポンスを返すルートに上書き
			await page.route("**/api/places/search**", (route) => {
				return route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(EMPTY_PLACES_RESPONSE),
				});
			});

			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.fill("存在しないスポット");
			await searchInput.press("Enter");
			await page.waitForTimeout(500);

			const cards = page.locator("div.rounded-md.bg-white.shadow");
			await expect(cards).toHaveCount(0);
		});
	});

	test.describe("APIエラー処理", () => {
		test("APIがエラーを返してもページがクラッシュしない", async ({
			page,
		}) => {
			await page.route("**/api/places/search**", (route) => {
				return route.abort();
			});

			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.fill("エラーテスト");
			await searchInput.press("Enter");
			await page.waitForTimeout(500);

			// ページがまだ存在していて検索バーが表示されていること
			await expect(searchInput).toBeVisible();
			// エラー時はカードが表示されないこと
			const cards = page.locator("div.rounded-md.bg-white.shadow");
			await expect(cards).toHaveCount(0);
		});
	});

	test.describe("PlaceCardの操作", () => {
		test("スポット名がリンクになっており正しいパスを持つ", async ({
			page,
		}) => {
			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.fill("カフェ");
			await searchInput.press("Enter");

			await page.waitForSelector("div.rounded-md.bg-white.shadow");

			// PlaceCard の Link は /places/:id へ遷移する
			const link = page.locator('a[href="/places/10"]');
			await expect(link).toBeVisible();
			await expect(link).toHaveText("モックカフェ渋谷店");
		});

		test("お気に入りボタンが各カードに表示される", async ({ page }) => {
			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.fill("カフェ");
			await searchInput.press("Enter");

			await page.waitForSelector("div.rounded-md.bg-white.shadow");

			// お気に入りボタン（bg-blue-100 rounded-full）が2件分あること
			const favoriteButtons = page.locator(
				"div.rounded-full.bg-blue-100",
			);
			await expect(favoriteButtons).toHaveCount(2);
		});

		test("「No Image」プレースホルダーが各カードに表示される", async ({
			page,
		}) => {
			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.fill("カフェ");
			await searchInput.press("Enter");

			await page.waitForSelector("div.rounded-md.bg-white.shadow");

			const noImageTexts = page.locator("text=No Image");
			await expect(noImageTexts).toHaveCount(2);
		});
	});

	test.describe("複数回の検索", () => {
		test("2回目の検索で結果が正しく更新される", async ({ page }) => {
			// 1回目の検索（2件）
			const searchInput = page.locator('input[placeholder="探す"]');
			await searchInput.fill("カフェ");
			await searchInput.press("Enter");
			await page.waitForSelector("div.rounded-md.bg-white.shadow");
			await expect(
				page.locator("div.rounded-md.bg-white.shadow"),
			).toHaveCount(2);

			// 2回目の検索（1件のレスポンスに変更）
			await page.route("**/api/places/search**", (route) => {
				return route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						places: [
							{
								id: 20,
								googlePlaceId: "mock-place-20",
								name: "2回目の検索結果",
								latitude: 35.68,
								longitude: 139.71,
								address: "東京都新宿区1-1-1",
								imageUrl: null,
							},
						],
					}),
				});
			});

			await searchInput.fill("公園");
			await searchInput.press("Enter");
			await page.waitForTimeout(500);

			await expect(
				page.locator("div.rounded-md.bg-white.shadow"),
			).toHaveCount(1);
			await expect(page.locator("text=2回目の検索結果")).toBeVisible();
		});
	});
});
