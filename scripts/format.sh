#!/usr/bin/env bash
set -euo pipefail

# 1. 単文の波括弧を外し、1行に寄せる
pnpm -r exec eslint --fix --rule '{"curly":["error","multi-or-nest"],"nonblock-statement-body-position":["error","beside"]}'

# 2. フォーマッタを実行する
pnpm exec oxfmt

# 3. 改行された文に波括弧を補正する
pnpm -r exec eslint --fix --rule '{"curly":["error","multi-line"]}'

# 4. フォーマットを整える
pnpm exec oxfmt
