#!/usr/bin/env bash
# setup_tmux.sh — parallel-dev-team 用 tmux セッション構築
#
# Usage:
#   ./setup_tmux.sh <SESSION_ID> <FEATURE_SLUG>
#
# 作成するレイアウト:
#
#  ┌──────────────────────┬──────────────────────────────────────┐
#  │  PANE 0: CONTRACT    │  PANE 1: ORCHESTRATOR                │
#  │  (contract.log)      │  (orchestrator.log)                  │
#  │                      ├──────────────────────────────────────┤
#  │                      │  PANE 2: BACKEND                     │
#  │                      │  (backend.log)                       │
#  │                      ├──────────────────────────────────────┤
#  │                      │  PANE 3: FRONTEND                    │
#  │                      │  (frontend.log)                      │
#  │                      ├──────────────────────────────────────┤
#  │                      │  PANE 4: TEST ENGINEER               │
#  │                      │  (test.log)                          │
#  │                      ├──────────────────────────────────────┤
#  │                      │  PANE 5: TECH LEAD                   │
#  │                      │  (techlead.log)                      │
#  └──────────────────────┴──────────────────────────────────────┘

set -euo pipefail

SESSION_ID="${1:?Usage: setup_tmux.sh <SESSION_ID> <FEATURE_SLUG>}"
FEATURE_SLUG="${2:?Usage: setup_tmux.sh <SESSION_ID> <FEATURE_SLUG>}"
LOG_DIR="/tmp/velobuddy-${SESSION_ID}"
TMUX_SESSION="vb-${FEATURE_SLUG}"

# ログディレクトリとファイルを初期化
mkdir -p "${LOG_DIR}"
for agent in contract orchestrator backend frontend test techlead; do
  touch "${LOG_DIR}/${agent}.log"
done

# tmux が利用できない場合はフォールバック
if ! command -v tmux &>/dev/null; then
  echo "[WARN] tmux が見つかりません。ログはファイルに書き込まれます。"
  echo "[INFO] 各エージェントのログ確認方法:"
  for agent in contract orchestrator backend frontend test techlead; do
    echo "       tail -f ${LOG_DIR}/${agent}.log"
  done
  exit 0
fi

# 既存セッションを削除
tmux kill-session -t "${TMUX_SESSION}" 2>/dev/null || true

# セッション作成（220x50 は一般的なワイド端末サイズ）
tmux new-session -d -s "${TMUX_SESSION}" -x 220 -y 55

# ウィンドウ名
tmux rename-window -t "${TMUX_SESSION}:0" "parallel-dev"

# レイアウト構築:
# まず左右に分割（左30% / 右70%）
tmux split-window -t "${TMUX_SESSION}:0.0" -h -p 70

# 右側（pane 1）を5分割（上から: Orchestrator, Backend, Frontend, Test, TechLead）
tmux split-window -t "${TMUX_SESSION}:0.1" -v -p 80
tmux split-window -t "${TMUX_SESSION}:0.2" -v -p 75
tmux split-window -t "${TMUX_SESSION}:0.3" -v -p 67
tmux split-window -t "${TMUX_SESSION}:0.4" -v -p 50

# 各ペインにヘッダーと tail を設定
# Pane 0: Contract / Status（左列）
tmux send-keys -t "${TMUX_SESSION}:0.0" \
  "printf '\\033[1;33m=== CONTRACT / STATUS ===\\033[0m\\n' && tail -f '${LOG_DIR}/contract.log'" Enter

# Pane 1: Orchestrator
tmux send-keys -t "${TMUX_SESSION}:0.1" \
  "printf '\\033[1;36m=== ORCHESTRATOR ===\\033[0m\\n' && tail -f '${LOG_DIR}/orchestrator.log'" Enter

# Pane 2: Backend
tmux send-keys -t "${TMUX_SESSION}:0.2" \
  "printf '\\033[1;34m=== BACKEND ===\\033[0m\\n' && tail -f '${LOG_DIR}/backend.log'" Enter

# Pane 3: Frontend
tmux send-keys -t "${TMUX_SESSION}:0.3" \
  "printf '\\033[1;32m=== FRONTEND ===\\033[0m\\n' && tail -f '${LOG_DIR}/frontend.log'" Enter

# Pane 4: Test Engineer
tmux send-keys -t "${TMUX_SESSION}:0.4" \
  "printf '\\033[1;35m=== TEST ENGINEER ===\\033[0m\\n' && tail -f '${LOG_DIR}/test.log'" Enter

# Pane 5: Tech Lead
tmux send-keys -t "${TMUX_SESSION}:0.5" \
  "printf '\\033[1;31m=== TECH LEAD ===\\033[0m\\n' && tail -f '${LOG_DIR}/techlead.log'" Enter

# セッション情報を env ファイルに追記
echo "TMUX_SESSION=${TMUX_SESSION}" >> "${LOG_DIR}/session.env"

echo "[INFO] tmuxセッション '${TMUX_SESSION}' を作成しました。"
echo "[INFO] アタッチするには: tmux attach -t ${TMUX_SESSION}"
echo "[INFO] ログディレクトリ: ${LOG_DIR}"
