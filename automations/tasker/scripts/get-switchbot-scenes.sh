#! /usr/bin/env bash

set -euo pipefail

: "${SWITCHBOT_API_TOKEN:?環境変数 SWITCHBOT_API_TOKEN が設定されていません}"
: "${SWITCHBOT_API_SECRET:?環境変数 SWITCHBOT_API_SECRET が設定されていません}"

TIMESTAMP=$(date +%s%3N)
NONCE=$(cat /proc/sys/kernel/random/uuid)
SIGN=$(
  printf '%s' "${SWITCHBOT_API_TOKEN}${TIMESTAMP}${NONCE}" \
    | openssl dgst -sha256 -hmac "${SWITCHBOT_API_SECRET}" -binary \
    | base64 -w 0
)

curl -sS "https://api.switch-bot.com/v1.1/scenes" \
  -H "Authorization: ${SWITCHBOT_API_TOKEN}" \
  -H "sign: ${SIGN}" \
  -H "t: ${TIMESTAMP}" \
  -H "nonce: ${NONCE}" \
  -H "Content-Type: application/json; charset=utf8"
printf '\n'
