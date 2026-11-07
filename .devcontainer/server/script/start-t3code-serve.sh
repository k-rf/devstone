#! /usr/bin/env bash

set -euo pipefail

LOG_FILE=/tmp/t3code-serve.log

if ! command -v t3 >/dev/null 2>&1; then
  echo "t3 command not found; skip t3 serve" >&2
  exit 0
fi

if pgrep -f '^t3 serve' >/dev/null 2>&1; then
  exit 0
fi

setsid -f t3 serve \
  --lan \
  --port 3773 \
  < /dev/null >> "${LOG_FILE}" 2>&1
