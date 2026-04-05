/**
 * Strava OAuth トークン取得スクリプト
 *
 * 使い方:
 *   1. https://www.strava.com/settings/api でアプリを作成
 *   2. .env に STRAVA_CLIENT_ID と STRAVA_CLIENT_SECRET を設定
 *   3. npx tsx scripts/strava/get-token.ts
 *   4. 表示されるURLをブラウザで開き、認可する
 *   5. リダイレクト先URLの ?code=XXXXX をコピーして貼り付ける
 *   6. 取得したトークンが表示される → .env に STRAVA_ACCESS_TOKEN として保存
 */
import "dotenv/config";
import * as readline from "readline";

const STRAVA_CLIENT_ID = process.env.STRAVA_AUTH_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_AUTH_CLIENT_SECRET;

if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
	console.error(
		"エラー: .env に STRAVA_AUTH_CLIENT_ID と STRAVA_AUTH_CLIENT_SECRET を設定してください",
	);
	process.exit(1);
}

const REDIRECT_URI = "http://localhost:3000/api/auth/callback/strava";
const SCOPE = "activity:read_all";

const authUrl =
	`https://www.strava.com/oauth/authorize` +
	`?client_id=${STRAVA_CLIENT_ID}` +
	`&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
	`&response_type=code` +
	`&scope=${SCOPE}`;

console.log("\n=== Strava OAuth トークン取得 ===\n");
console.log("1. 以下のURLをブラウザで開いてください:\n");
console.log(authUrl);
console.log(
	"\n2. 認可後、リダイレクト先URLの ?code=XXXXX の部分をコピーしてください",
);
console.log("   (ページが開けなくてもURLバーからcodeを取得できます)\n");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

rl.question("認可コードを入力: ", async (code) => {
	rl.close();

	const trimmedCode = code.trim();
	if (!trimmedCode) {
		console.error("エラー: コードが入力されませんでした");
		process.exit(1);
	}

	try {
		const response = await fetch("https://www.strava.com/oauth/token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				client_id: STRAVA_CLIENT_ID,
				client_secret: STRAVA_CLIENT_SECRET,
				code: trimmedCode,
				grant_type: "authorization_code",
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			console.error(`\nエラー (${response.status}):`, error);
			process.exit(1);
		}

		const data = await response.json();

		console.log("\n=== トークン取得成功 ===\n");
		console.log(
			`アスリート: ${data.athlete?.firstname} ${data.athlete?.lastname}`,
		);
		console.log(`Access Token: ${data.access_token}`);
		console.log(`Refresh Token: ${data.refresh_token}`);
		console.log(
			`有効期限: ${new Date(data.expires_at * 1000).toLocaleString("ja-JP")}`,
		);
		console.log("\n以下を .env に追加してください:\n");
		console.log(`STRAVA_ACCESS_TOKEN="${data.access_token}"`);
		console.log(`STRAVA_REFRESH_TOKEN="${data.refresh_token}"`);
	} catch (err) {
		console.error("\nトークン交換に失敗:", err);
		process.exit(1);
	}
});
