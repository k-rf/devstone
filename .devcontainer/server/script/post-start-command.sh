#! /usr/bin/env bash

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# === SSH Agent Socket Auto-Discovery ===
# ホストからマウントされた agent ディレクトリから最新の有効ソケットを検出して設定する
AGENT_DIR="/home/devstone/.ssh/agent"
if [ -d "$AGENT_DIR" ]; then
  LATEST_SOCK=$(find "$AGENT_DIR" -maxdepth 2 -type s -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -f2- -d" ")
  if [ -n "$LATEST_SOCK" ]; then
    export SSH_AUTH_SOCK="$LATEST_SOCK"
  fi
fi

"${SCRIPT_DIR}/start-cursor-agent.sh"
"${SCRIPT_DIR}/start-orca-serve.sh"
