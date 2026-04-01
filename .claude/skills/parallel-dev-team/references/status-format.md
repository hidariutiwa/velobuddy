# ステータスログ形式仕様

各エージェントは `/tmp/velobuddy-<SESSION_ID>/<agent>.log` にステータスを書き込む。

## ログファイル一覧

| ファイル           | 書き込むエージェント |
| ------------------ | -------------------- |
| `contract.log`     | contract-designer    |
| `orchestrator.log` | orchestrator         |
| `backend.log`      | backend-dev          |
| `frontend.log`     | frontend-dev         |
| `test.log`         | test-engineer        |
| `techlead.log`     | tech-lead            |

## ログ行フォーマット

```
[HH:MM:SS] [AGENT_NAME] [STATUS] メッセージ
```

- `[HH:MM:SS]` — 24時間形式のローカル時刻
- `[AGENT_NAME]` — 大文字: `CONTRACT`, `ORCHESTRATOR`, `BACKEND`, `FRONTEND`, `TEST`, `TECH-LEAD`
- `[STATUS]` — 下記のステータストークンのいずれか
- `メッセージ` — 人間が読める進捗説明（日本語または英語）

## ステータストークン一覧

| トークン      | 意味         | 使用シーン                         |
| ------------- | ------------ | ---------------------------------- |
| `START`       | 作業開始     | エージェントが最初の処理を始めた時 |
| `PROGRESS`    | 作業中       | ファイル作成・処理の途中経過       |
| `BLOCKED`     | 依存待ち     | 他チームの完了・ユーザーの判断待ち |
| `DONE`        | 完了         | 担当作業が全て完了した時           |
| `FAIL`        | 失敗         | エラーが発生し作業を中断した時     |
| `REVIEW_PASS` | レビュー通過 | tech-leadがそのチームをPASSと判定  |
| `REVIEW_FAIL` | レビュー失敗 | tech-leadがそのチームをFAILと判定  |

## 実際のログ例

```
[14:23:01] [CONTRACT] [START] Analyzing feature: cycling-route-sharing
[14:23:45] [CONTRACT] [PROGRESS] Designing TypeScript interfaces
[14:24:12] [CONTRACT] [PROGRESS] Running type-design-analyzer quality check
[14:24:30] [CONTRACT] [DONE] contract.json written to /tmp/velobuddy-1234/contract.json

[14:24:35] [ORCHESTRATOR] [START] Decomposing feature: cycling-route-sharing
[14:24:50] [ORCHESTRATOR] [PROGRESS] Backend brief: POST /api/routes + src/lib/routes.ts
[14:24:52] [ORCHESTRATOR] [PROGRESS] Frontend brief: RouteCard component + /routes page
[14:24:54] [ORCHESTRATOR] [PROGRESS] Test brief: routes.test.ts + route.test.ts
[14:25:00] [ORCHESTRATOR] [DONE] BRIEFS_READY

[14:25:05] [BACKEND] [START] Implementing cycling-route-sharing backend
[14:25:10] [BACKEND] [PROGRESS] Writing src/types/route.ts
[14:25:30] [BACKEND] [PROGRESS] Writing src/lib/routes.ts
[14:26:00] [BACKEND] [PROGRESS] Writing src/app/api/routes/route.ts
[14:26:45] [BACKEND] [PROGRESS] Running npm run lint
[14:27:00] [BACKEND] [DONE] Backend implementation complete

[14:25:05] [FRONTEND] [START] Implementing cycling-route-sharing UI
[14:25:15] [FRONTEND] [PROGRESS] Writing src/types/route.ts
[14:25:40] [FRONTEND] [PROGRESS] Writing src/components/RouteCard.tsx
[14:26:30] [FRONTEND] [PROGRESS] Writing src/app/routes/page.tsx
[14:27:10] [FRONTEND] [DONE] Frontend implementation complete

[14:25:05] [TEST] [START] Writing tests for cycling-route-sharing
[14:25:20] [TEST] [PROGRESS] Writing src/lib/__tests__/routes.test.ts
[14:26:10] [TEST] [PROGRESS] Writing src/app/api/routes/__tests__/route.test.ts
[14:27:05] [TEST] [DONE] Test files created

[14:27:15] [TECH-LEAD] [START] Review round 1
[14:27:20] [TECH-LEAD] [PROGRESS] Running code-reviewer on backend diff
[14:27:25] [TECH-LEAD] [PROGRESS] Running silent-failure-hunter on backend diff
[14:27:30] [TECH-LEAD] [PROGRESS] Running code-reviewer on frontend diff
[14:27:35] [TECH-LEAD] [PROGRESS] Running pr-test-analyzer on test diff
[14:28:00] [TECH-LEAD] [REVIEW_FAIL] backend: Missing try/catch in src/app/api/routes/route.ts:42
[14:28:00] [TECH-LEAD] [REVIEW_PASS] frontend
[14:28:00] [TECH-LEAD] [REVIEW_PASS] test
[14:28:00] [TECH-LEAD] [DONE] Review round 1 complete. Overall: FAIL

[14:28:10] [BACKEND] [START] Fixing review feedback (round 2)
[14:28:30] [BACKEND] [PROGRESS] Adding try/catch to route.ts:42
[14:28:45] [BACKEND] [DONE] Fix complete

[14:28:50] [TECH-LEAD] [START] Review round 2
[14:29:10] [TECH-LEAD] [REVIEW_PASS] backend
[14:29:10] [TECH-LEAD] [DONE] Review round 2 complete. Overall: PASS
```

## review-result.json 形式

`${LOG_DIR}/review-result.json` — tech-leadが書き込む機械可読な判定結果:

```json
{
	"pass": false,
	"round": 1,
	"timestamp": "2026-04-01T14:28:00+09:00",
	"feedback": {
		"backend": {
			"pass": false,
			"issues": [
				{
					"severity": "critical",
					"file": "src/app/api/routes/route.ts",
					"line": 42,
					"message": "PrismaコールがtryV/catchで囲まれていない"
				}
			]
		},
		"frontend": {
			"pass": true,
			"issues": []
		},
		"test": {
			"pass": true,
			"issues": []
		}
	}
}
```

`severity` の値: `"critical"` | `"warning"` | `"info"`

criticalが1件でもあれば `pass: false`。warningとinfoはPASS判定に影響しない。
