# @devstone/modggl

Toggl 2.0 API を利用してタイムエントリーの同一エントリー結合・隙間補完・重複解消を行う
バッチ CLI アプリケーションです。公開 HTTP エンドポイントを持たない純粋な CLI として設計されており、
GCP Cloud Run Jobs 上で定期実行・任意実行されます。

## 必須環境変数

`src/adapter/inbound/cli/env.middleware.ts` の `loadEnv` を正とします。

- `TOGGL_API_TOKEN`: Toggl 2.0 API の Bearer トークン（空白のみ不可）。
- `TOGGL_ORGANIZATION_ID`: 対象の Toggl Organization ID（正の整数）。
- `TOGGL_WORKSPACE_ID`: 対象の Toggl Workspace ID（正の整数）。
- `DISCORD_WEBHOOK_URL`: Discord Incoming Webhook URL（`https://discord.com/api/webhooks/...` 形式）。
  通知が有効な実行（通常実行および `--dry-run --notify`）では必須です。`--no-notify` または既定の `--dry-run` 時は省略できます。

## CLI オプション・終了コード

```bash
bun run apps/modggl/dist/bun/modggl.js [options]
```

| オプション          | 型        | デフォルト    | 説明                                           |
| ------------------- | --------- | ------------- | ---------------------------------------------- |
| `--since <ISO8601>` | `string`  | `now - days`  | 取得開始日時（ISO 8601 / UTC）                 |
| `--until <ISO8601>` | `string`  | `now + 1 day` | 取得終了日時（ISO 8601 / UTC）                 |
| `--days <integer>`  | `number`  | `7`           | `--since` 省略時の遡及日数（正の整数）         |
| `--dry-run`         | `boolean` | `false`       | API への書き込みを行わず、計画結果のみ出力する |
| `--notify`          | `boolean` | `false`       | `--dry-run` 指定時でも通知を有効化する         |
| `--no-notify`       | `boolean` | `false`       | 通知を無効化する（`--notify` との併用不可）    |

- `--notify` / `--no-notify` をどちらも指定しない場合、`--dry-run` 時は通知オフ、
  通常実行時は通知オンになります。
- **終了コード `0`**: `completed` / `no_changes` / `dry_run`（標準出力に構造化 JSON を出力）。
- **終了コード `1`**: 判定不能重複による全停止（`aborted`）、外部 API エラー、日時範囲不正、
  または環境変数・CLI 引数不正（標準エラー出力に構造化 JSON またはエラーを出力）。

### Discord 通知仕様

`NotificationPort`（`src/core/port/outbound/notification/notification.port.ts`）の実装として
`DiscordAdapterLive`（`src/adapter/outbound/discord/discord.adapter.ts`）を接続し、
通知オフ時は `NotificationNoopLive` に切り替わります。

- `completed`（緑）: 補正・削除件数、取得/除外件数、残クォータを Embed で通知
- `no_changes`（グレー）: 日次バッチの死活監視として変更 0 件である旨を Embed で通知
- `dry_run`（青、`--dry-run --notify` 時）: 書き込みなしのドライラン結果を Embed で通知
- `aborted`（橙）: 判定不能重複（`NotDetermine` / `InvalidOrder`）による停止と競合 2 件の詳細を通知
- `error`（赤）: 外部 API エラー内容・HTTP ステータス・クォータリセット秒数を通知

## ローカル実行・Docker ビルド

### ローカルでのビルド・実行

リポジトリルートでワークスペース全体をビルドしたうえで、Bun バンドルを生成・実行します。

```bash
pnpm run build
pnpm --filter @devstone/modggl run build:bun
```

環境変数を設定してドライランを実行する例です。

```bash
TOGGL_API_TOKEN=toggl_sk_xxx \
TOGGL_ORGANIZATION_ID=123456 \
TOGGL_WORKSPACE_ID=789012 \
bun run apps/modggl/dist/bun/modggl.js --dry-run --days 7
```

### Docker イメージのビルド

`apps/modggl/Dockerfile` は `oven/bun:latest` → `oven/bun:alpine` のマルチステージビルドです。
リポジトリルートから次のスクリプトでビルドできます。

```bash
pnpm run build:modggl
```

## インフラ構築（Pulumi / GCP）

`apps/modggl/infra/` は `@pulumi/gcp` を用いた独立した Pulumi スタックです
（ルートの `pnpm-workspace.yaml` および `moon` タスクからは分離されています）。

### 管理される主なリソース

- **Artifact Registry**: Docker リポジトリ（`asia-northeast1`）
- **Service Account**: Cloud Run Job 実行用 `modggl-job-sa`、Cloud Scheduler 起動用 `modggl-scheduler-sa`
- **Secret Manager**: `modggl-toggl-api-token`（`TOGGL_API_TOKEN`）、
  `modggl-discord-webhook-url`（`DISCORD_WEBHOOK_URL`）および `modggl-job-sa` への
  `roles/secretmanager.secretAccessor` 付与
- **Cloud Run Jobs v2**: `modggl`（公開エンドポイントなし、`maxRetries: 0`、環境変数と Secret 参照を設定）
- **Cloud Run Job IAM**: `modggl-scheduler-sa` に `roles/run.invoker`、Make OAuth
  プリンシパルに `roles/run.jobsExecutorWithOverrides` を付与
- **Cloud Scheduler**: 日次 `0 5 * * *`（`Asia/Tokyo`、`retryCount: 0`）で `jobs:run` API へ OAuth POST

### セットアップとデプロイ手順

1. 依存関係をインストールし、型チェックを確認します。

   ```bash
   pnpm --dir apps/modggl/infra --ignore-workspace install --allow-build=!protobufjs
   pnpm --dir apps/modggl/infra --ignore-workspace exec tsc --noEmit
   ```

2. `apps/modggl/infra/Pulumi.production.yaml`（または新しいスタック設定）を実環境向けに更新します。
   - `gcp:project`: デプロイ先の GCP プロジェクト ID
   - `gcp:region`: リージョン（既定 `asia-northeast1`）
   - `modggl:imageTag`: Artifact Registry にプッシュ済みのコンテナイメージタグ
   - `modggl:togglOrganizationId` / `modggl:togglWorkspaceId`: Toggl の ID
   - `modggl:makeExecutorMember`: Make 連携用 Google OAuth プリンシパル（例: `user:...@example.com`）

3. Artifact Registry へイメージをプッシュし、Secret Manager のシークレット `modggl-toggl-api-token` と
   `modggl-discord-webhook-url` にそれぞれ実値のシークレットバージョンを登録したうえで差分確認・適用を行います。

   ```bash
   cd apps/modggl/infra
   pulumi stack select production
   pulumi preview
   pulumi up
   ```

## Make からの任意実行（HTTP モジュール）

Make の既存 Google OAuth 2.0 接続を利用し、Cloud Run Jobs v2 の `jobs:run` API を直接呼び出します。
Make 側の OAuth プリンシパルには Pulumi 構成で `roles/run.jobsExecutorWithOverrides` が付与されます。

- **メソッド / URL**:
  `POST https://run.googleapis.com/v2/projects/{project}/locations/{region}/jobs/{jobName}:run`
- **デフォルト引数での実行（リクエストボディ）**:

  ```json
  {}
  ```

- **期間・ドライラン指定での実行（`overrides.containerOverrides[].args`）**:

  ```json
  {
    "overrides": {
      "containerOverrides": [
        {
          "args": ["--days", "14", "--dry-run"]
        }
      ]
    }
  }
  ```
