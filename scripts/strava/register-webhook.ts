/**
 * Strava Webhook 登録スクリプト
 *
 * 使い方:
 *   1. .env に STRAVA_AUTH_CLIENT_ID, STRAVA_AUTH_CLIENT_SECRET を設定
 *   2. npx tsx scripts/strava/register-webhook.ts <callback_url>
 *
 * 例:
 *   npx tsx scripts/strava/register-webhook.ts https://your-app.herokuapp.com/api/strava/webhook
 *
 * 確認:
 *   npx tsx scripts/strava/register-webhook.ts --list
 *
 * 削除:
 *   npx tsx scripts/strava/register-webhook.ts --delete <subscription_id>
 */
import "dotenv/config";

const CLIENT_ID = process.env.STRAVA_AUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_AUTH_CLIENT_SECRET;
const VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN ?? "velobuddy";
const BASE = "https://www.strava.com/api/v3/push_subscriptions";

if (!CLIENT_ID || !CLIENT_SECRET) {
	console.error("エラー: STRAVA_AUTH_CLIENT_ID/SECRET が未設定です");
	process.exit(1);
}

const args = process.argv.slice(2);

async function listSubscriptions() {
	const res = await fetch(
		`${BASE}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
	);
	const data = await res.json();
	console.log("現在のサブスクリプション:", JSON.stringify(data, null, 2));
}

async function createSubscription(callbackUrl: string) {
	console.log(
		`\nWebhook登録中...\n  callback: ${callbackUrl}\n  verify_token: ${VERIFY_TOKEN}\n`,
	);

	const res = await fetch(BASE, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: CLIENT_ID!,
			client_secret: CLIENT_SECRET!,
			callback_url: callbackUrl,
			verify_token: VERIFY_TOKEN,
		}),
	});

	const data = await res.json();
	if (res.ok) {
		console.log("登録成功:", data);
		console.log(`\nサブスクリプションID: ${data.id}`);
	} else {
		console.error(`エラー (${res.status}):`, data);
	}
}

async function deleteSubscription(id: string) {
	const res = await fetch(
		`${BASE}/${id}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
		{ method: "DELETE" },
	);

	if (res.ok) {
		console.log(`サブスクリプション ${id} を削除しました`);
	} else {
		console.error(`エラー (${res.status}):`, await res.text());
	}
}

if (args[0] === "--list") {
	listSubscriptions();
} else if (args[0] === "--delete" && args[1]) {
	deleteSubscription(args[1]);
} else if (args[0] && !args[0].startsWith("--")) {
	createSubscription(args[0]);
} else {
	console.log("使い方:");
	console.log("  npx tsx scripts/strava/register-webhook.ts <callback_url>");
	console.log("  npx tsx scripts/strava/register-webhook.ts --list");
	console.log("  npx tsx scripts/strava/register-webhook.ts --delete <id>");
}
