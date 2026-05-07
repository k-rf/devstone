#! /usr/bin/env bash

INPUT=$(cat)
# ツール入力を取得
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# 対象外なら即終了
[[ -z "$FILE_PATH" || ! "$FILE_PATH" =~ \.(ts|js|md|json)x?$ ]] && echo '{"decision": "allow"}' && exit 0

# 絶対パスの解決
if [[ "$FILE_PATH" == /* ]]; then
    ABS_FILE_PATH="$FILE_PATH"
else
    ABS_FILE_PATH="$(pwd)/$FILE_PATH"
fi

# ワークスペースルートからの相対パス
RELATIVE_FILE_PATH="${ABS_FILE_PATH#$(pwd)/}"

# package.json があるディレクトリ（プロジェクトのルート）を探す
DIR_PATH=$(dirname "$ABS_FILE_PATH")
PROJECT_ROOT=""
while [[ "$DIR_PATH" != "/" ]]; do
    if [[ -f "$DIR_PATH/package.json" ]]; then
        PROJECT_ROOT="$DIR_PATH"
        break
    fi
    DIR_PATH=$(dirname "$DIR_PATH")
done

if [[ -z "$PROJECT_ROOT" ]]; then
    PROJECT_ROOT="$(pwd)"
fi

# 整形実行（ワークスペースルートから実行）
OXFMT_OUTPUT=$(pnpm oxfmt "$ABS_FILE_PATH" 2>&1)
if [ $? -ne 0 ]; then
    SAFE_OUTPUT=$(echo "$OXFMT_OUTPUT" | jq -aRs .)
    echo "{\"decision\": \"deny\", \"reason\": \"oxfmt failed: $SAFE_OUTPUT\", \"systemMessage\": \"⚠️ Format Error\"}"
    exit 2
fi

# プロジェクトのルートに移動して以降の処理を行う
cd "$PROJECT_ROOT" || exit 1

# Lint実行
if ! pnpm eslint --fix "$ABS_FILE_PATH" > /dev/null 2>&1; then
    echo "{\"decision\": \"deny\", \"reason\": \"eslint failed for $RELATIVE_FILE_PATH\", \"systemMessage\": \"⚠️ Lint Error\"}"
    exit 2
fi

# TS以外ならここで終了
[[ ! "$ABS_FILE_PATH" =~ \.tsx?$ ]] && echo '{"decision": "allow"}' && exit 0

# 型チェック
if [[ -f "tsconfig.check.json" ]]; then
    STDERR=$(pnpm tsc -p tsconfig.check.json 2>&1 > /dev/null)
    EXIT_CODE=$?
else
    EXIT_CODE=0
fi

if [[ $EXIT_CODE -ne 0 ]]; then
    if echo "$STDERR" | grep -q "was not found by the project service"; then
        echo '{"decision": "allow"}'
        exit 0
    fi
    echo "{\"decision\": \"deny\", \"reason\": \"Type check failed in $PROJECT_ROOT:\\n$STDERR\", \"systemMessage\": \"⚠️ Validation Error\"}"
    exit 2
fi

echo '{"decision": "allow"}'
