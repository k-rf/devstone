#! /usr/bin/env bash

set -euo pipefail

CONFIG="eslint.format.config.ts"

# 単文の波括弧を外し、1行に寄せる
pnpm exec eslint --no-config-lookup --no-inline-config -c "$CONFIG" --fix --rule '{"curly":["warn","multi-or-nest"],"nonblock-statement-body-position":["warn","beside"]}'
pnpm exec oxfmt

# 改行された文に波括弧を補正する
pnpm exec eslint --no-config-lookup --no-inline-config -c "$CONFIG" --fix --rule '{"curly":["warn","multi-line"]}'
pnpm exec oxfmt
