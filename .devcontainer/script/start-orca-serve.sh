#! /usr/bin/env bash

set -euo pipefail

ORCA_LAUNCHER=/opt/orca/squashfs-root/AppRun
LOG_FILE=/tmp/orca-serve.log

if [[ ! -x "${ORCA_LAUNCHER}" ]]; then
  echo "Orca launcher not found: ${ORCA_LAUNCHER}" >&2
  exit 0
fi

if pgrep -f '/opt/orca/squashfs-root/' >/dev/null 2>&1; then
  exit 0
fi

if [[ -z "${ORCA_PAIRING_ADDRESS:-}" ]]; then
  echo "ORCA_PAIRING_ADDRESS is not set; skip orca serve" >&2
  exit 0
fi

# Devcontainer が DISPLAY を渡していると、壊れた X ロックで serve が即終了する。
setsid -f env -u DISPLAY LIBGL_ALWAYS_SOFTWARE=1 \
  "${ORCA_LAUNCHER}" --no-sandbox serve \
  --port 6768 \
  --pairing-address "${ORCA_PAIRING_ADDRESS}" \
  --mobile-pairing \
  < /dev/null >> "${LOG_FILE}" 2>&1
