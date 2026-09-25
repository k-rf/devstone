# notion-toggl-bridge

Notion のボタン押下をトリガーに Toggl Track のタイマーを開始する Cloudflare Workers アプリケーションです。

## セットアップ

### 1. Cloudflare KV の作成

キャッシュ用の KV Namespace を作成します。

```bash
pnpm wrangler kv namespace create TOGGL_MAPPER
```

作成された ID を `wrangler.json` の `kv_namespaces[0].id` に設定してください。

### 2. 必須環境変数・シークレットの設定

`src/adapter/inbound/http/env-validator.middleware.ts` の `Env` を正とします。以下の環境変数・シークレットが必要です。

- `NOTION_TOGGL_BRIDGE_API_TOKEN`: Notion インテグレーションの内部インテグレーション・トークン。
- `NOTION_WEBHOOK_SECRET`: Notion の Send Webhook アクションで設定する `X-Shared-Secret` ヘッダの値。
- `SLACK_WEBHOOK_URL`: エラー通知用の Slack Incoming Webhook URL。
- `TOGGL_API_TOKEN`: Toggl Track の API Token。
- `TOGGL_WORKSPACE_ID`: Toggl のワークスペース ID。

本番環境向けには `wrangler secret put` で設定します。

## 開発・起動

- **通常**: `pnpm --filter notion-toggl-bridge run dev`（`op run -- wrangler dev`。1Password 前提）。
- **1Password が無い場合**: `apps/notion-toggl-bridge/.dev.vars` に上記必須シークレットを置き、
  `pnpm exec wrangler dev` で直接起動できます（KV `TOGGL_MAPPER` は miniflare がローカル模擬）。

## デプロイ

```bash
pnpm run deploy
```

## エンドポイント

- `GET /`: 認証不要。稼働確認に使用できます。
- `POST /toggl/start`: Notion の Webhook から呼び出されます。`X-Shared-Secret` ヘッダで検証します。

## Notion 側の設定

タイムブロックを管理するデータベースに「ボタン」プロパティを作成し、以下の「Webhook を送信」アクションを設定します。

- **URL**: `https://<your-worker-url>/toggl/start`
- **HTTP ヘッダー**: `X-Shared-Secret` に `NOTION_WEBHOOK_SECRET` と同じ値を設定。
- **Properties**: `☑️ やること`（relation プロパティ）を選択。

## その他・テスト

- 外部 API（Notion / Toggl / Slack）はテストでは MSW でモックされます。実呼び出しには実トークンが必要です。
- KV へのマッパー投入は `scripts/seed.ts`（要 `scripts/mapper.json`、gitignore 対象）を参照してください。
