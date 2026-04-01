#!/usr/bin/env bash
# teardown.sh — parallel-dev-team セッションのクリーンアップ
#
# Usage:
#   ./teardown.sh <SESSION_ID>
#
# 実行内容:
#   1. git worktree を3つ削除
#   2. feature/*-{backend,frontend,test} ブランチを削除
#   3. /tmp/velobuddy-<SESSION_ID>/ を保持（ログ確認用）

set -euo pipefail

SESSION_ID="${1:?Usage: teardown.sh <SESSION_ID>}"
LOG_DIR="/tmp/velobuddy-${SESSION_ID}"

if [ ! -f "${LOG_DIR}/session.env" ]; then
  echo "[ERROR] session.env not found: ${LOG_DIR}/session.env"
  exit 1
fi

# session.env を読み込む
# shellcheck source=/dev/null
source "${LOG_DIR}/session.env"

REPO_PATH="/workspaces/velobuddy"

log() {
  echo "[$(date +%H:%M:%S)] [TEARDOWN] $*"
}

log "Starting teardown for session: ${SESSION_ID}"

# 1. worktree を削除
for team in backend frontend test; do
  WORKTREE_PATH="${LOG_DIR}/worktrees/${team}"
  BRANCH="feature/${FEATURE_SLUG}-${team}"

  if [ -d "${WORKTREE_PATH}" ]; then
    log "Removing worktree: ${team} (${WORKTREE_PATH})"
    git -C "${REPO_PATH}" worktree remove --force "${WORKTREE_PATH}" 2>/dev/null || rm -rf "${WORKTREE_PATH}"
  fi

  # ブランチを削除（マージ済みの場合）
  if git -C "${REPO_PATH}" branch --list "${BRANCH}" | grep -q "${BRANCH}"; then
    log "Deleting branch: ${BRANCH}"
    git -C "${REPO_PATH}" branch -D "${BRANCH}" 2>/dev/null || true
  fi
done

# 2. worktree pruneを実行（孤立したworktreeエントリを整理）
git -C "${REPO_PATH}" worktree prune
log "Git worktrees cleaned up."

# 3. ログの保持を通知
log "Logs preserved at: ${LOG_DIR}"
echo ""
echo "=== Teardown complete ==="
echo "ログファイルは以下に保持されています:"
echo "  ${LOG_DIR}/"
echo ""
echo "削除する場合: rm -rf ${LOG_DIR}"
