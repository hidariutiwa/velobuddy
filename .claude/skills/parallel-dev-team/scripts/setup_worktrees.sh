#!/usr/bin/env bash
# setup_worktrees.sh — backend / frontend / test チーム用 git worktree 作成
#
# Usage:
#   ./setup_worktrees.sh <SESSION_ID> <FEATURE_SLUG> <REPO_PATH>
#
# 作成されるworktree:
#   /tmp/velobuddy-<SESSION_ID>/worktrees/backend  (branch: feature/<SLUG>-backend)
#   /tmp/velobuddy-<SESSION_ID>/worktrees/frontend (branch: feature/<SLUG>-frontend)
#   /tmp/velobuddy-<SESSION_ID>/worktrees/test     (branch: feature/<SLUG>-test)

set -euo pipefail

SESSION_ID="${1:?Usage: setup_worktrees.sh <SESSION_ID> <FEATURE_SLUG> <REPO_PATH>}"
FEATURE_SLUG="${2:?Usage: setup_worktrees.sh <SESSION_ID> <FEATURE_SLUG> <REPO_PATH>}"
REPO_PATH="${3:-/workspaces/velobuddy}"
LOG_DIR="/tmp/velobuddy-${SESSION_ID}"
WORKTREE_BASE="${LOG_DIR}/worktrees"

mkdir -p "${WORKTREE_BASE}"

log() {
  echo "[$(date +%H:%M:%S)] [SETUP] $*"
}

# main ブランチが最新であることを確認
log "Fetching latest main branch..."
git -C "${REPO_PATH}" fetch origin main 2>/dev/null || log "Warning: fetch failed (offline?)"

for team in backend frontend test; do
  BRANCH="feature/${FEATURE_SLUG}-${team}"
  WORKTREE_PATH="${WORKTREE_BASE}/${team}"

  # 既存のworktreeがあれば削除
  if [ -d "${WORKTREE_PATH}" ]; then
    log "Removing existing worktree for ${team}..."
    git -C "${REPO_PATH}" worktree remove --force "${WORKTREE_PATH}" 2>/dev/null || rm -rf "${WORKTREE_PATH}"
  fi

  # ブランチが存在すれば削除（クリーンな状態から開始）
  git -C "${REPO_PATH}" branch -D "${BRANCH}" 2>/dev/null || true

  # main から新しいブランチを作成してworktreeを追加
  git -C "${REPO_PATH}" worktree add -b "${BRANCH}" "${WORKTREE_PATH}" main

  log "Worktree created: ${team} → ${WORKTREE_PATH} (branch: ${BRANCH})"
done

# worktreeパスを session.env に追記
cat >> "${LOG_DIR}/session.env" << ENV
WORKTREE_BACKEND=${WORKTREE_BASE}/backend
WORKTREE_FRONTEND=${WORKTREE_BASE}/frontend
WORKTREE_TEST=${WORKTREE_BASE}/test
ENV

log "All worktrees ready under ${WORKTREE_BASE}"
log "Session env updated: ${LOG_DIR}/session.env"
