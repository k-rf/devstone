# notion-toggl-bridge

Notion のボタン押下をトリガーに Toggl Track のタイマーを開始する Cloudflare Workers アプリケーションです。

## セットアップ

### 1. Cloudflare KV の作成

キャッシュ用の KV Namespace を作成します。

```bash
pnpm wrangler kv namespace create TOGGL_MAPPER
```

作成された ID を `wrangler.json` の `kv_namespaces[0].id` に設定してください。

### 2. シークレットの設定

以下のシークレットを `wrangler secret put` で設定します。

- `NOTION_WEBHOOK_SECRET`: Notion の Send Webhook アクションで設定する `X-Shared-Secret` ヘッダの値。
- `NOTION_API_TOKEN`: Notion インテグレーションの内部インテグレーション・トークン。
- `TOGGL_API_TOKEN`: Toggl Track の API Token。
- `SLACK_WEBHOOK_URL`: エラー通知用の Slack Incoming Webhook URL。

## 開発

```bash
pnpm run dev
```

## デプロイ

```bash
pnpm run deploy
```

## Notion 側の設定

タイムブロックを管理するデータベースに「ボタン」プロパティを作成し、以下の「Webhook を送信」アクションを設定します。

- **URL**: `https://<your-worker-url>/toggl/start`
- **HTTP ヘッダー**: `X-Shared-Secret` に `NOTION_WEBHOOK_SECRET` と同じ値を設定。
- **Properties**: `☑️ やること`（relation プロパティ）を選択。
