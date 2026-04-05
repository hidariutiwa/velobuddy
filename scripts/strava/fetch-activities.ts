/**
 * Strava アクティビティ取得スクリプト
 *
 * 使い方:
 *   1. get-token.ts でアクセストークンを取得済みであること
 *   2. .env に STRAVA_ACCESS_TOKEN を設定
 *   3. npx tsx scripts/strava/fetch-activities.ts
 *
 * オプション:
 *   --per-page=N    一覧の取得件数 (デフォルト: 10)
 *   --detail=N      詳細を取得するアクティビティ数 (デフォルト: 3)
 *   --all-types     サイクリング以外も含める
 */
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";

const STRAVA_ACCESS_TOKEN = process.env.STRAVA_ACCESS_TOKEN;
const BASE_URL = "https://www.strava.com/api/v3";
const OUTPUT_DIR = path.join(
	path.dirname(new URL(import.meta.url).pathname),
	"responses",
);

if (!STRAVA_ACCESS_TOKEN) {
	console.error(
		"エラー: .env に STRAVA_ACCESS_TOKEN を設定してください\n" +
			"まず get-token.ts を実行してトークンを取得してください",
	);
	process.exit(1);
}

// CLI引数パース
const args = process.argv.slice(2);
const getArg = (name: string, defaultValue: number): number => {
	const arg = args.find((a) => a.startsWith(`--${name}=`));
	return arg ? parseInt(arg.split("=")[1], 10) : defaultValue;
};
const perPage = getArg("per-page", 10);
const detailCount = getArg("detail", 3);
const allTypes = args.includes("--all-types");

const headers = { Authorization: `Bearer ${STRAVA_ACCESS_TOKEN}` };

async function fetchJson(url: string): Promise<unknown> {
	const response = await fetch(url, { headers });
	if (!response.ok) {
		const error = await response.text();
		throw new Error(`API Error (${response.status}): ${error}`);
	}
	return response.json();
}

function saveJson(filename: string, data: unknown): void {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	const filepath = path.join(OUTPUT_DIR, filename);
	fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
	console.log(`  保存: ${filepath}`);
}

interface SummaryActivity {
	id: number;
	name: string;
	type: string;
	sport_type: string;
	distance: number;
	moving_time: number;
	[key: string]: unknown;
}

async function main() {
	console.log("\n=== Strava アクティビティ取得 ===\n");

	// 1. アクティビティ一覧取得
	console.log(`一覧取得中 (per_page=${perPage})...`);
	const activities = (await fetchJson(
		`${BASE_URL}/athlete/activities?per_page=${perPage}`,
	)) as SummaryActivity[];

	saveJson("activities-list.json", activities);
	console.log(`  取得件数: ${activities.length}\n`);

	// サイクリングのみフィルタ
	const rides = allTypes
		? activities
		: activities.filter(
				(a) =>
					a.type === "Ride" ||
					a.sport_type === "Ride" ||
					a.sport_type === "EBikeRide" ||
					a.sport_type === "VirtualRide",
			);

	console.log(
		allTypes
			? `全アクティビティ: ${rides.length}件`
			: `サイクリング: ${rides.length}件 / ${activities.length}件`,
	);

	// 一覧のサマリ表示
	rides.forEach((a, i) => {
		console.log(
			`  ${i + 1}. [${a.sport_type}] ${a.name} — ${(a.distance / 1000).toFixed(1)}km, ${Math.floor(a.moving_time / 60)}分`,
		);
	});

	// 2. 詳細取得
	const detailTargets = rides.slice(0, detailCount);
	if (detailTargets.length > 0) {
		console.log(`\n詳細取得中 (${detailTargets.length}件)...`);

		for (const activity of detailTargets) {
			console.log(`  ${activity.name} (ID: ${activity.id})...`);
			const detail = await fetchJson(
				`${BASE_URL}/activities/${activity.id}`,
			);
			saveJson(`activity-detail-${activity.id}.json`, detail);
		}
	}

	// 3. フィールド一覧の出力（DB設計の参考用）
	console.log("\n=== フィールド分析 ===\n");

	if (rides.length > 0) {
		console.log("【一覧レスポンス (SummaryActivity) のフィールド】");
		const sampleSummary = rides[0];
		for (const [key, value] of Object.entries(sampleSummary)) {
			const type = value === null ? "null" : typeof value;
			const display =
				typeof value === "object"
					? JSON.stringify(value)
					: String(value);
			console.log(`  ${key}: ${type} = ${display.substring(0, 80)}`);
		}
	}

	const detailFile = detailTargets[0]
		? path.join(OUTPUT_DIR, `activity-detail-${detailTargets[0].id}.json`)
		: null;

	if (detailFile && fs.existsSync(detailFile)) {
		console.log("\n【詳細レスポンス (DetailedActivity) の追加フィールド】");
		const detail = JSON.parse(fs.readFileSync(detailFile, "utf-8"));
		const summaryKeys = new Set(Object.keys(rides[0]));

		for (const [key, value] of Object.entries(detail)) {
			if (!summaryKeys.has(key)) {
				const type = value === null ? "null" : typeof value;
				const display =
					typeof value === "object"
						? JSON.stringify(value)
						: String(value);
				console.log(`  ${key}: ${type} = ${display.substring(0, 80)}`);
			}
		}
	}

	console.log(
		"\n完了! responses/ ディレクトリのJSONファイルを確認してください\n",
	);
}

main().catch((err) => {
	console.error("エラー:", err);
	process.exit(1);
});
