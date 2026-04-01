# Git Worktree 戦略

parallel-dev-teamスキルがコンフリクトを回避しながら並列開発を実現するための
ブランチ・マージ戦略の詳細ドキュメント。

## なぜ worktree を使うか

通常の並列開発では、複数のエージェントが同じディレクトリで作業すると
ファイルの競合やgitの状態の混乱が発生する。

git worktreeを使うことで:

- 各チームが**物理的に分離されたディレクトリ**で作業できる
- 同じリポジトリの異なるブランチを同時にチェックアウトできる
- `npm install` 不要（node_modulesはmainリポジトリと共有される）

## ブランチ命名規則

```
feature/<FEATURE_SLUG>-backend   # バックエンドチームの作業ブランチ
feature/<FEATURE_SLUG>-frontend  # フロントエンドチームの作業ブランチ
feature/<FEATURE_SLUG>-test      # テストチームの作業ブランチ
feature/<FEATURE_SLUG>-integration  # 統合用ブランチ（フェーズ4で作成）
```

## ディレクトリ構造

```
/workspaces/velobuddy/          # mainリポジトリ（読み取り参照用）
/tmp/velobuddy-<SESSION>/
  worktrees/
    backend/                    # feature/<SLUG>-backend をチェックアウト
    frontend/                   # feature/<SLUG>-frontend をチェックアウト
    test/                       # feature/<SLUG>-test をチェックアウト
```

## 所有範囲（コンフリクトを構造的に防ぐ）

各チームの担当ディレクトリは重複しない:

| チーム            | 書き込み可能なパス             |
| ----------------- | ------------------------------ |
| Backend           | `src/app/api/**`               |
| Backend           | `src/lib/**`                   |
| Frontend          | `src/app/<非APIページ>/**`     |
| Frontend          | `src/components/**`            |
| Test              | `**/__tests__/**`              |
| Test              | `**/*.test.ts`                 |
| Contract Designer | `src/types/**`（並列前に完成） |

**注意:** `src/types/` はcontract-designerが事前に定義した内容を
各チームがworktreeにコピーする（同一内容のため3-wayマージで自動解決）。

## フェーズ4: 統合手順

コードレビューPASS後、3ブランチを統合ブランチにsquash-merge:

```bash
cd /workspaces/velobuddy
INTEGRATION_BRANCH="feature/${FEATURE_SLUG}-integration"

# 統合ブランチを main から作成
git checkout -b "${INTEGRATION_BRANCH}" main

# 各チームのブランチをsquash-merge（コミット履歴をまとめる）
git merge "feature/${FEATURE_SLUG}-backend"  --squash --no-commit
git merge "feature/${FEATURE_SLUG}-frontend" --squash --no-commit
git merge "feature/${FEATURE_SLUG}-test"     --squash --no-commit

# 全変更をまとめてコミット
git add -A
git commit -m "feat(<FEATURE_SLUG>): implement <機能名>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

## コンフリクトが発生した場合

理論上は所有範囲の設計でコンフリクトは発生しないが、
`src/types/` で発生した場合の解決手順:

1. `${LOG_DIR}/contract.json` の `typeFiles` が**正解**
2. コンフリクトファイルを contract.json の内容で上書きする:
    ```bash
    # contract.jsonから該当ファイルの内容を取得して上書き
    # （jqまたは手動で抽出）
    ```
3. `git add <file>` してマージを続行

## クリーンアップ（フェーズ6）

```bash
# worktreeを削除
git worktree remove --force /tmp/velobuddy-<SESSION>/worktrees/backend
git worktree remove --force /tmp/velobuddy-<SESSION>/worktrees/frontend
git worktree remove --force /tmp/velobuddy-<SESSION>/worktrees/test

# 孤立エントリを整理
git worktree prune

# 開発ブランチを削除（integrationブランチにマージ済み）
git branch -D "feature/${FEATURE_SLUG}-backend"
git branch -D "feature/${FEATURE_SLUG}-frontend"
git branch -D "feature/${FEATURE_SLUG}-test"
```

integrationブランチはPR作成後、マージされたタイミングでGitHubから削除される。

## node_modules の共有について

worktreeは同じリポジトリの別ディレクトリとして機能するため、
各チームのworktreeから `/workspaces/velobuddy/node_modules/` が参照される。

`npm install` の実行は不要。
ただし新しいパッケージが必要な場合（原則禁止）は
mainリポジトリで `npm install` を実行し、全worktreeに反映される。
