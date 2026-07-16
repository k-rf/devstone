---
trigger: always_on
---

# Applications

> [!NOTE] このファイルの役割
> 各アプリケーションの起動方法・必須環境変数・ローカル実行時の注意点を記載しています。
> コマンド一覧の全体像は [Commands](./commands.md) を参照してください。

## easel (`apps/easel`)

JSON-Canvas（`.canvas`）を型安全に作成・編集する CLI。ローカルファイルのみを扱い、外部依存はありません。

- **実行**: ビルド後に `node apps/easel/dist/main.js --help` で利用できます。
- **オプション記法**: 1 文字は単ダッシュ（例: `-x`, `-y`）、複数文字は二重ダッシュ（例: `--width`, `--text`）。

## notion-toggl-bridge (`apps/notion-toggl-bridge`)

Notion の Webhook ボタン押下を契機に Toggl Track のタイマーを開始する Cloudflare Workers（Hono）アプリ。

### 起動

- **通常**: `pnpm --filter notion-toggl-bridge run dev`（`op run -- wrangler dev`。1Password 前提）。
- **1Password が無い場合**: `apps/notion-toggl-bridge/.dev.vars` に必須シークレットを置き、
  `pnpm exec wrangler dev` で直接起動できます（KV `TOGGL_MAPPER` は miniflare がローカル模擬）。

### 必須環境変数

`src/adapter/inbound/http/env-validator.middleware.ts` の `Env` を正とします。

- `NOTION_TOGGL_BRIDGE_API_TOKEN`
- `NOTION_WEBHOOK_SECRET`
- `SLACK_WEBHOOK_URL`
- `TOGGL_API_TOKEN`
- `TOGGL_WORKSPACE_ID`

### エンドポイント

- `GET /`: 認証不要。稼働確認に使えます。
- `POST /toggl/start`: `X-Shared-Secret` ヘッダで検証します。

### その他

- 外部 API（Notion / Toggl / Slack）はテストでは MSW でモックされます。実呼び出しには実トークンが必要です。
- KV へのマッパー投入は `scripts/seed.ts`（要 `scripts/mapper.json`、gitignore 対象）を参照してください。
