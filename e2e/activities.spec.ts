import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORT = { width: 390, height: 844 };

test.describe("アクティビティページ (/activities)", () => {
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

		await page.goto("/activities");
	});

	test("「アクティビティ一覧」の見出しが表示される", async ({ page }) => {
		const heading = page.locator("text=アクティビティ一覧");
		await expect(heading).toBeVisible();
	});

	test("mockActivities の件数（6件）分のアクティビティシートが表示される", async ({
		page,
	}) => {
		// ActivitySheet は border-t border-b border-zinc-200 bg-white の div として描画される
		// 各シートは距離情報（km）を含む
		const distanceLabels = page.locator("text=km");
		await expect(distanceLabels).toHaveCount(6);
	});

	test("各アクティビティシートに距離が表示される", async ({ page }) => {
		// mockActivities の全エントリは distance: 10.54
		const firstDistance = page.locator("text=10.54").first();
		await expect(firstDistance).toBeVisible();
	});

	test("各アクティビティシートに走行時間が表示される", async ({ page }) => {
		// drivingTime: 1823 秒 → 00:30:23
		const displayTime = page.locator("text=00:30:23").first();
		await expect(displayTime).toBeVisible();
	});

	test("アクティビティリストがスクロール可能な領域に収まっている", async ({
		page,
	}) => {
		// スクロールコンテナは overflow-y-auto クラスを持つ div
		const scrollContainer = page.locator(".overflow-y-auto").first();
		await expect(scrollContainer).toBeVisible();
	});
});
