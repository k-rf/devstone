#! /usr/bin/env bash

set -euo pipefail

format_with_rule() {
  pnpm exec eslint --no-config-lookup --no-inline-config -c eslint.format.config.ts --fix --rule "$1"
  pnpm exec oxfmt
}

# 単文の波括弧を外し、1行に寄せる
format_with_rule '{"curly":["warn","multi-or-nest"],"nonblock-statement-body-position":["warn","beside"]}'

# 改行された文に波括弧を補正する
format_with_rule '{"curly":["warn","multi-line"]}'
