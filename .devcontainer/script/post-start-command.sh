#!/usr/bin/env bash

set -euo pipefail

if pgrep -f 'cursor-agent/versions/.*/index\.js worker start' >/dev/null 2>&1; then
  exit 0
fi

LOG_FILE="/tmp/cursor-agent-worker.log"

setsid -f agent worker start \
  --name "devstone-hermod.dc" \
  --worker-dir "${ROOT_REMOTE_WORKSPACES}" \
  --idle-release-timeout 0 < /dev/null >> "${LOG_FILE}" 2>&1
