#! /usr/bin/env bash

INPUT=$(cat)
# workspace root からの相対パス
RELATIVE_FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# 対象外（JS/TS, MD, JSON 以外）なら即終了
[[ -z "$RELATIVE_FILE_PATH" || ! "$RELATIVE_FILE_PATH" =~ \.(ts|js|md|json)x?$ ]] && echo '{"decision": "allow"}' && exit 0

# 絶対パスを取得
ABS_FILE_PATH="$(pwd)/$RELATIVE_FILE_PATH"

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

# package.json が見つからない場合はワークスペースのルートを使用
if [[ -z "$PROJECT_ROOT" ]]; then
    PROJECT_ROOT="$(pwd)"
fi

# プロジェクトのルートに移動
cd "$PROJECT_ROOT" || exit 1

# 整形実行（oxfmt はルートから実行しても問題ないことが多いが、一応プロジェクト内で行う）
if ! pnpm oxfmt "$ABS_FILE_PATH" > /dev/null 2>&1; then
    echo "{\"decision\": \"deny\", \"reason\": \"oxfmt failed for $RELATIVE_FILE_PATH\", \"systemMessage\": \"⚠️ Format Error\"}"
    exit 2
fi

# Lint実行（プロジェクト固有の eslint.config.ts を読み込ませる）
if ! pnpm eslint --fix "$ABS_FILE_PATH" > /dev/null 2>&1; then
    echo "{\"decision\": \"deny\", \"reason\": \"eslint failed for $RELATIVE_FILE_PATH\", \"systemMessage\": \"⚠️ Lint Error\"}"
    exit 2
fi

# TS以外ならここで終了
[[ ! "$ABS_FILE_PATH" =~ \.tsx?$ ]] && echo '{"decision": "allow"}' && exit 0

# 型チェック（プロジェクト固有の tsconfig.check.json を使用）
if [[ -f "tsconfig.check.json" ]]; then
    STDERR=$(pnpm tsc -p tsconfig.check.json 2>&1 > /dev/null)
    EXIT_CODE=$?
else
    # プロジェクトに設定がない場合はスキップするか、必要ならルートのものを使う
    EXIT_CODE=0
fi

# 型エラーの処理
if [[ $EXIT_CODE -ne 0 ]]; then
    # 特定のエラーなら許可して終了（例: プロジェクトサービスで見つからない場合）
    if echo "$STDERR" | grep -q "was not found by the project service"; then
        echo '{"decision": "allow"}'
        exit 0
    fi

    # それ以外のエラーは拒否して exit 2
    echo "{\"decision\": \"deny\", \"reason\": \"Type check failed in $PROJECT_ROOT:\\n$STDERR\", \"systemMessage\": \"⚠️ Validation Error\"}"
    exit 2
fi

echo '{"decision": "allow"}'
