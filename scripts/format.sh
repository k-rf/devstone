#! /usr/bin/env bash

set -euo pipefail

# 単文の波括弧を外し、1行に寄せる
pnpm -r exec eslint --fix --rule '{"curly":["error","multi-or-nest"],"nonblock-statement-body-position":["error","beside"]}'
pnpm exec oxfmt

# 改行された文に波括弧を補正する
pnpm -r exec eslint --fix --rule '{"curly":["error","multi-line"]}'
pnpm exec oxfmt
