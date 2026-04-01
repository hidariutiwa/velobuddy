---
name: parallel-dev-team
description: >
    バックエンド・フロントエンド・テストの3チームAIエンジニアが並列で機能開発を行い、
    自動コードレビュー・統合テスト・PR作成まで全サイクルを実行するスキル。
    ユーザーが「○○機能を追加して」「○○を実装して」「APIとUIを作って」「新しい画面を作って」
    「○○ページを追加して」と言った場合に必ずこのスキルを使用する。
    バックエンドAPIとフロントエンドUIの両方が必要な機能開発に適用する。
    tmuxによるリアルタイム進捗可視化付き。
tools: Bash, Read, Glob, Grep, Task
---

# Parallel Dev Team

バックエンド・フロントエンド・テストの3チームが並列で機能開発し、
コードレビュー→統合テスト→PR作成までを自動化するワークフロー。

## 全体フロー

```
フェーズ0:   セットアップ（tmux + worktree）
フェーズ0.5: 契約設計（型定義・API仕様）← 並列の前提条件
フェーズ1:   チーム結成・タスク分解
フェーズ2:   並列開発（Backend / Frontend / Test 同時起動）
フェーズ3:   コードレビューループ（最大3ラウンド）
フェーズ4:   統合テスト
フェーズ5:   PR作成
フェーズ6:   クリーンアップ
```

---

## フェーズ0: セットアップ

### 1. SESSION_ID を生成

```bash
FEATURE_SLUG=$(echo "<機能名>" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')
SESSION_ID="$(date +%s)-${FEATURE_SLUG}"
LOG_DIR="/tmp/velobuddy-${SESSION_ID}"
mkdir -p "${LOG_DIR}"
echo "SESSION_ID=${SESSION_ID}" > "${LOG_DIR}/session.env"
echo "FEATURE_SLUG=${FEATURE_SLUG}" >> "${LOG_DIR}/session.env"
echo "LOG_DIR=${LOG_DIR}" >> "${LOG_DIR}/session.env"
```

### 2. tmuxセッション起動

```bash
bash /home/vscode/.claude/skills/parallel-dev-team/scripts/setup_tmux.sh \
  "${SESSION_ID}" "${FEATURE_SLUG}"
```

tmuxが使えない場合: ログは `/tmp/velobuddy-<SESSION_ID>/` に書き込まれ続ける。
ユーザーに `tail -f /tmp/velobuddy-<SESSION_ID>/<agent>.log` で確認できることを伝える。

### 3. git worktree作成

```bash
bash /home/vscode/.claude/skills/parallel-dev-team/scripts/setup_worktrees.sh \
  "${SESSION_ID}" "${FEATURE_SLUG}" "/workspaces/velobuddy"
```

worktreeが作成される場所:

- `/tmp/velobuddy-<SESSION_ID>/worktrees/backend` (branch: `feature/<SLUG>-backend`)
- `/tmp/velobuddy-<SESSION_ID>/worktrees/frontend` (branch: `feature/<SLUG>-frontend`)
- `/tmp/velobuddy-<SESSION_ID>/worktrees/test` (branch: `feature/<SLUG>-test`)

---

## フェーズ0.5: 契約設計（必須・順次）

**これが完了するまで並列開発を開始しない。**

Agent ツールで `agents/contract-designer.md` を起動する。

提供する情報:

- 機能の説明
- SESSION_ID と LOG_DIR のパス
- `/workspaces/velobuddy/prisma/schema.prisma` の内容（参照用）
- `/workspaces/velobuddy/src/types/` の既存型定義

contract-designer は以下を出力する:

- `${LOG_DIR}/contract.json` — TypeScript interface定義 + APIエンドポイント仕様
- `${LOG_DIR}/contract.log` — 人間向けサマリ

**contract.json が存在し、空でないことを確認してから次へ。**

---

## フェーズ1: チーム結成・タスク分解

Agent ツールで `agents/orchestrator.md` を起動する。

提供する情報:

- 機能の説明
- SESSION_ID、LOG_DIR
- contract.json の内容
- worktreeパス一覧

orchestratorは以下をログに書き込む:

- バックエンド向けタスクブリーフ
- フロントエンド向けタスクブリーフ
- テスト向けタスクブリーフ

`orchestrator.log` に `[ORCHESTRATOR] [DONE] BRIEFS_READY` が書き込まれたら次へ。

---

## フェーズ2: 並列開発（3エージェント同時起動）

**3つのAgentツール呼び出しを1つのメッセージで同時に送る（必須）。**

それぞれに提供する情報:

- 各チーム向けタスクブリーフ（orchestratorから）
- SESSION_ID、LOG_DIR
- contract.json のパス
- 各チームのworktreeパス

各エージェント:

- `agents/backend-dev.md` → worktrees/backend
- `agents/frontend-dev.md` → worktrees/frontend
- `agents/test-engineer.md` → worktrees/test

全チームのログに `[DONE]` が書き込まれるまで待機。
いずれかが `[FAIL]` を書き込んだ場合はユーザーに報告してフェーズを一時停止。

---

## フェーズ3: コードレビューループ

```
MAX_ROUNDS = 3
round = 1
```

**ループ:**

1. Agent ツールで `agents/tech-lead.md` を起動
    - 提供: 3チームのworktreeパス、LOG_DIR、round番号
2. `${LOG_DIR}/review-result.json` を読む
3. `pass: true` → ループを抜けてフェーズ4へ
4. `pass: false` かつ `round < MAX_ROUNDS`:
    - 失敗したチームのみ再起動（各エージェントに `issues` 配列を渡す）
    - `round++` してループの先頭へ
5. `round >= MAX_ROUNDS` かつ `pass: false`:
    - `orchestrator.log` に `[BLOCKED]` を書き込む
    - ユーザーに失敗内容を報告し、手動対応を依頼

---

## フェーズ4: 統合テスト

```bash
cd /workspaces/velobuddy
INTEGRATION_BRANCH="feature/${FEATURE_SLUG}-integration"

git checkout -b "${INTEGRATION_BRANCH}" main
git merge "feature/${FEATURE_SLUG}-backend" --squash --no-commit
git merge "feature/${FEATURE_SLUG}-frontend" --squash --no-commit
git merge "feature/${FEATURE_SLUG}-test" --squash --no-commit
git add -A
git commit -m "chore: integrate ${FEATURE_SLUG} branches for testing"

npm run test
```

- テスト成功 → フェーズ5へ
- テスト失敗 → 出力をユーザーに見せ、対応を確認

---

## フェーズ5: PR作成

`commit-commands:commit-push-pr` スキルを呼び出す。

PRの説明文には orchestrator が作成したタスクブリーフのサマリを含める。

---

## フェーズ6: クリーンアップ

```bash
bash /home/vscode/.claude/skills/parallel-dev-team/scripts/teardown.sh "${SESSION_ID}"
```

teardown.sh は以下を実行:

1. 3つのworktreeを削除
2. feature/\*-{backend,frontend,test} ブランチを削除
3. ユーザーに「tmuxセッションを終了しますか？」と確認
4. 確認後、`tmux kill-session -t "vb-${FEATURE_SLUG}"`

---

## ログの読み方

各エージェントのステータスは `${LOG_DIR}/<agent>.log` で確認できる。
形式: `[HH:MM:SS] [AGENT] [STATUS] メッセージ`

STATUS一覧:

- `START` — 作業開始
- `PROGRESS` — 作業中
- `BLOCKED` — 依存待ち
- `DONE` — 完了
- `FAIL` — 失敗
- `REVIEW_PASS` / `REVIEW_FAIL` — tech-leadの判定

詳細: `references/status-format.md`

---

## 参照

- `agents/` — 各エージェントの詳細な役割と指示
- `references/status-format.md` — ログフォーマット仕様
- `references/worktree-strategy.md` — ブランチ・マージ戦略の詳細
