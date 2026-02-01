#!/usr/bin/env bash

# 編集されたファイルのパスを環境変数から取得
FILE="$EDITED_FILE"

# ファイルが指定されていない場合は終了
if [[ -z "$FILE" ]]; then
  exit 0
fi

# ファイルが存在し、マークダウンファイルの場合はlintを実行
if [[ -f "$FILE" && "$FILE" == *.md ]]; then
  echo "Linting markdown file: $FILE"
  pnpm exec markdownlint-cli2 "$FILE"
fi
