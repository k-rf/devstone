#!/usr/bin/env bash
set -euo pipefail

INPUT=$(cat)
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcriptPath // empty')

if [ -z "$TRANSCRIPT_PATH" ] || [ ! -f "$TRANSCRIPT_PATH" ]; then
  echo '{"decision": "ask"}'
  exit 0
fi

# 最新の PLANNER_RESPONSE ステップから可視テキスト (content) を取得する
# tail で直近のログを抽出し、jq の last で末尾の PLANNER_RESPONSE を取得
LAST_CONTENT=$(tail -n 30 "$TRANSCRIPT_PATH" | jq -s -r 'map(select(.type == "PLANNER_RESPONSE")) | last | .content // empty')
TRIMMED_CONTENT=$(echo "$LAST_CONTENT" | tr -d '[:space:]')

if [ -z "$TRIMMED_CONTENT" ]; then
  echo '{"decision": "deny", "reason": "【規律違反】ツールを実行する前に、必ずユーザー向けの可視メッセージで目的と変更内容を説明してください。"}'
  exit 0
fi

echo '{"decision": "ask"}'
exit 0
