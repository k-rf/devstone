# AGENTS.md

このリポジトリで作業するエージェント向けの補足情報です。
プロジェクトの理念・設計原則は `GEMINI.md` / `CLAUDE.md` を参照してください。

## Cursor Cloud specific instructions

Cursor Cloud のスナップショットには、以下がセットアップ済みの状態で起動します。
（依存の再取得は起動時の update script が `proto install` → `pnpm install` を実行します。）

### ツールチェーン

- ツールのバージョンは `proto`（`.prototools`）で管理されます: node 26.3.0 / pnpm 11.5.1 / bun 1.3.14 / moon 2.3.0。
- `proto` の shim は `~/.bashrc` で PATH に追加されます。コマンドが見つからない場合は `source ~/.bashrc` してください。

### ビルド前提（型チェック / lint）

- `typecheck` と `lint` はワークスペースパッケージのビルド成果物（`dist`）を解決します。
- `dist` が無い状態（クリーンチェックアウト直後など）では
  `Cannot find module '@devstone/...'` で型チェックが失敗します。
  先に `moon run :build` を実行してください（moon がキャッシュするため通常は一度で十分）。

### 完了の定義

- `GEMINI.md` の通り、完了は `pnpm run check:all` が終了コード 0 で終わることです
  （format / typecheck / lint / lint:md / knip / test:cov）。

### サービスと実行方法

コマンドの詳細は各 `package.json` の `scripts` を参照してください。

- **easel**（`apps/easel`）: JSON-Canvas（`.canvas`）を編集する CLI。
  ビルド後に `node apps/easel/dist/main.js --help` で実行できます。
  1 文字オプションは単ダッシュ（例: `-x`, `-y`）、複数文字は二重ダッシュ（例: `--width`, `--text`）です。
- **notion-toggl-bridge**（`apps/notion-toggl-bridge`）: Cloudflare Workers（Hono）。
  - `package.json` の `dev` は `op run -- wrangler dev`（1Password 前提）です。
  - 1Password が無い環境では `apps/notion-toggl-bridge/.dev.vars` に必要なシークレットを置き、
    `pnpm exec wrangler dev` で直接起動できます（KV `TOGGL_MAPPER` は miniflare がローカル模擬）。
  - 必須の環境変数は `src/adapter/inbound/http/env-validator.middleware.ts` の `Env` を参照
    （`NOTION_TOGGL_BRIDGE_API_TOKEN` / `NOTION_WEBHOOK_SECRET` / `SLACK_WEBHOOK_URL` /
    `TOGGL_API_TOKEN` / `TOGGL_WORKSPACE_ID`）。
  - `GET /` は認証不要で稼働確認に使えます。`POST /toggl/start` は `X-Shared-Secret` ヘッダで検証します。
  - 外部 API（Notion / Toggl / Slack）はテストでは MSW でモックされます。実 API 呼び出しには実トークンが必要です。
  - KV へのマッパー投入は `scripts/seed.ts`（要 `scripts/mapper.json`、gitignore 対象）を参照。
