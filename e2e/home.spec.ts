import { test, expect, Page } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 390, height: 844 };

// Google Maps JS API とタイル画像のリクエストをインターセプトしてブロック
async function mockGoogleMaps(page: Page) {
	await page.route("**/maps/api/js**", (route) => route.abort());
	await page.route("**/maps.googleapis.com/**", (route) => route.abort());
	await page.route("**/mts.googleapis.com/**", (route) => route.abort());
	await page.route("**/maps.gstatic.com/**", (route) => route.abort());
}

// /api/places/search をモックする
async function mockPlacesSearch(page: Page) {
	await page.route("**/api/places/search**", (route) => {
		return route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({
				places: [
					{
						id: 1,
						googlePlaceId: "test-place-1",
						name: "テストカフェ",
						latitude: 35.6714,
						longitude: 139.6956,
						address: "東京都渋谷区テスト1-1",
						imageUrl: null,
					},
					{
						id: 2,
						googlePlaceId: "test-place-2",
						name: "テスト公園",
						latitude: 35.68,
						longitude: 139.7,
						address: "東京都渋谷区テスト2-2",
						imageUrl: null,
					},
				],
			}),
		});
	});
}

test.describe("ホーム画面 (/)", () => {
	test.beforeEach(async ({ page }) => {
		await page.setViewportSize(MOBILE_VIEWPORT);
		await mockGoogleMaps(page);
		await mockPlacesSearch(page);
		await page.goto("/");
		await page.waitForLoadState("domcontentloaded");
	});

	test("ページが正常に表示される", async ({ page }) => {
		await expect(page).toHaveURL("/");
		// MainContainer が描画されていること
		await expect(page.locator("div.bg-blue-50").first()).toBeVisible();
	});

	test("Googleマップのコンテナが表示される", async ({ page }) => {
		// GoogleMap コンポーネントが描画する外側の div（h-full w-full クラス）
		const mapContainer = page.locator("div.h-full.w-full").first();
		await expect(mapContainer).toBeVisible();
	});

	test("検索バーが表示される", async ({ page }) => {
		const searchInput = page.locator('input[placeholder="探す"]');
		await expect(searchInput).toBeVisible();
	});

	test("GPSボタンが表示される", async ({ page }) => {
		// 検索バー右隣の丸ボタン（bg-white shadow-md rounded-full）
		const gpsButton = page.locator(
			"div.absolute.top-24 button.rounded-full.bg-white.shadow-md",
		);
		await expect(gpsButton).toBeVisible();
	});

	test("カテゴリチップが5つ全て表示される", async ({ page }) => {
		const categories = ["すべて", "カフェ", "公園", "食事", "観光"];
		for (const cat of categories) {
			const chip = page.locator("button", { hasText: cat });
			await expect(chip).toBeVisible();
		}
	});

	test("初期状態で「すべて」チップがアクティブ（青色）になっている", async ({
		page,
	}) => {
		const activeChip = page.locator("button.bg-blue-500", {
			hasText: "すべて",
		});
		await expect(activeChip).toBeVisible();
	});

	test("カテゴリチップをクリックするとアクティブ状態が切り替わる", async ({
		page,
	}) => {
		const cafeChip = page.locator("button", { hasText: "カフェ" });
		await cafeChip.click();

		// カフェチップがアクティブになる
		await expect(
			page.locator("button.bg-blue-500", { hasText: "カフェ" }),
		).toBeVisible();

		// 以前のアクティブチップ「すべて」が非アクティブになる
		await expect(
			page.locator("button.bg-white", { hasText: "すべて" }),
		).toBeVisible();
	});

	test("PlaceBarが画面下部に表示される", async ({ page }) => {
		// PlaceBar は mockPlaces[0] = 代々木公園 を表示する
		const placeBar = page.locator("text=代々木公園");
		await expect(placeBar).toBeVisible();
	});

	test("PlaceBarにスポット名・カテゴリ・住所が表示される", async ({
		page,
	}) => {
		await expect(page.locator("text=代々木公園")).toBeVisible();
		await expect(
			page
				.locator("p")
				.filter({ hasText: /^公園$/ })
				.first(),
		).toBeVisible();
		await expect(
			page.locator("text=東京都渋谷区代々木神園町2-1"),
		).toBeVisible();
	});

	test("検索バーにEnterキーを押すとAPIが呼ばれる", async ({ page }) => {
		const searchInput = page.locator('input[placeholder="探す"]');
		await searchInput.fill("カフェ");

		let apiCalled = false;
		await page.route("**/api/places/search**", (route) => {
			apiCalled = true;
			return route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ places: [] }),
			});
		});

		await searchInput.press("Enter");
		await page.waitForTimeout(500);
		expect(apiCalled).toBe(true);
	});

	test("検索バーが空の場合はEnterキーを押してもAPIが呼ばれない", async ({
		page,
	}) => {
		let apiCalled = false;
		await page.route("**/api/places/search**", (route) => {
			apiCalled = true;
			return route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ places: [] }),
			});
		});

		const searchInput = page.locator('input[placeholder="探す"]');
		// 空のまま Enter
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
				body: JSON.stringify({ places: [] }),
			});
		});

		const searchInput = page.locator('input[placeholder="探す"]');
		await searchInput.fill("   ");
		await searchInput.press("Enter");
		await page.waitForTimeout(300);
		expect(apiCalled).toBe(false);
	});
});
