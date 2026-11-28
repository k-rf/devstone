# @devstone/modggl

Toggl 2.0 API を利用してタイムエントリーの同一エントリー結合・隙間補完・重複解消を行う
バッチ CLI アプリケーションです。公開 HTTP エンドポイントを持たない純粋な CLI として設計されており、
GCP Cloud Run Jobs 上で定期実行・任意実行されます。

## 補正ルール・除外条件・停止理由

- **同一エントリーの結合**: 種別・タスク・プロジェクト・クライアント・説明・タグ集合（順不同）・
  課金フラグがすべて一致する隣接エントリーを 1 つにまとめます。片方にのみ予定ブロックまたは
  カレンダー連携（`planned_start` / `planned_duration` / `calendar_event_id`）がある場合は
  連携付きエントリーを優先保持し、両方に連携がある場合は結合せず保護します。
- **隙間補完と重複解消**: 先行エントリーの終了が後続エントリーの開始より前であれば隙間を埋めるよう
  先行終了時刻を延長し、重なっていれば後方開始時刻に合わせて先行終了時刻を切り詰めます（後方開始優先）。
  Toggl 2.0 PATCH API の仕様に合わせて開始時刻・区間長ともに秒単位へ正規化し、サブ秒差による不要な再更新を防ぎます。
- **除外対象（`excludedCount`）**: `start` または `duration` が未設定（計測中・予定のみ）、
  `duration < 0`、`deleted_at` / `archived_at` 設定済み、`draft: true`、`pattern_managed: true`、
  `lock_reason` 設定済みのエントリーは取得件数（`fetchedCount`）には計上されますが、補正対象から除外されます。
- **All-or-Nothing 保護と停止理由**: マージ前に全エントリーの順序異常と同一開始時刻の異内容競合を検査し、
  機械決定できない状態を 1 件でも検出した場合は API への書き込みを一切行わず `aborted` で終了します。
  - `NotDetermine`: 同一開始時刻で異なる内容のエントリーが競合している状態（`Equivalent` / `GreaterOuter` /
    `LessInner`）、または両方スケジュール連携付きで同一時刻に重複している状態です。手動で時刻や内容を修正して再実行してください。
  - `InvalidOrder`: 開始時刻や包含関係の順序がソート済み前提と逆転している状態です
    （重複しない逆転 `Greater` や `GreaterOverlap` / `GreaterInner` を含みます）。

## 必須環境変数

`src/config/load-env.ts` の `loadEnv` を正とします。

- `TOGGL_API_TOKEN`: Toggl 2.0 API の Bearer トークン
  （空白・改行・制御文字を含まない印字可能 ASCII）。
- `TOGGL_ORGANIZATION_ID`: 対象の Toggl Organization ID（正の整数）。
- `TOGGL_WORKSPACE_ID`: 対象の Toggl Workspace ID（正の整数）。
- `DISCORD_WEBHOOK_URL`: Discord Incoming Webhook URL
  （`https://discord.com/api/webhooks/<数字ID>/<トークン>` 形式）。
  通知が有効な実行（通常実行および `--dry-run --notify`）では必須です。`--no-notify` または既定の `--dry-run` 時は省略できます。

## CLI オプション・終了コード

```bash
bun run apps/modggl/dist/bun/modggl.js [options]
```

| オプション          | 型        | デフォルト    | 説明                                              |
| ------------------- | --------- | ------------- | ------------------------------------------------- |
| `--since <ISO8601>` | `string`  | `now - days`  | 取得開始日時（ISO 8601 / 実在暦日検証あり / UTC） |
| `--until <ISO8601>` | `string`  | `now + 1 day` | 取得終了日時（ISO 8601 / 実在暦日検証あり / UTC） |
| `--days <integer>`  | `number`  | `7`           | `--since` 省略時の遡及日数（1〜3650 の整数）      |
| `--dry-run`         | `boolean` | `false`       | API への書き込みを行わず、計画結果のみ出力する    |
| `--notify`          | `boolean` | `false`       | `--dry-run` 指定時でも通知を有効化する            |
| `--no-notify`       | `boolean` | `false`       | 通知を無効化する（`--notify` との併用不可）       |

- `--notify` / `--no-notify` をどちらも指定しない場合、`--dry-run` 時は通知オフ、
  通常実行時は通知オンになります。
- **終了コード `0`**: `completed` / `no_changes` / `dry_run`（標準出力に構造化 JSON を出力）。
  通知送信に失敗した場合でも本体処理は成功とし、標準エラー出力へ `status: "warning"` の JSON を出力します。
- **終了コード `1`**: 判定不能重複または順序異常による全停止（`aborted`）、外部 API エラー、日時範囲不正、
  または環境変数・CLI 引数不正（標準エラー出力に構造化 JSON またはエラーを出力）。

### Discord 通知仕様

`NotificationPort`（`src/core/port/outbound/notification/notification.port.ts`）の実装として
`DiscordAdapterLive`（`src/adapter/outbound/discord/discord.adapter.ts`）を接続し、
通知オフ時は `NotificationNoopAdapterLive`（`src/adapter/outbound/notification/noop.adapter.ts`）に切り替わります。

- `completed`（緑）: 補正・削除件数、取得/除外件数、残クォータを Embed で通知
- `no_changes`（グレー）: 日次バッチの死活監視として変更 0 件である旨を Embed で通知
- `dry_run`（青、`--dry-run --notify` 時）: 書き込みなしのドライラン結果を Embed で通知
- `aborted`（橙）: 判定不能重複または順序異常（`NotDetermine` / `InvalidOrder`）による停止と競合 2 件の詳細を通知
- `error`（赤）: 外部 API エラー内容・HTTP ステータス・クォータリセット秒数を通知

## ローカル実行・Docker ビルド

### ローカルでのビルド・実行

`.prototools` で管理されている Bun（`1.4.4`）・Node・pnpm が必要です。
リポジトリルートでワークスペース全体をビルドしたうえで、Bun バンドルを生成・実行します。

```bash
moon run :build
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

`apps/modggl/Dockerfile` は `oven/bun:1.4.4` → `oven/bun:1.4.4-alpine` のマルチステージビルドです。
`runner` ステージは非 root ユーザー（`bun`）で実行されます。リポジトリルートから次のスクリプトでビルドできます。

```bash
pnpm run build:modggl
```

## インフラ構築（Pulumi / GCP）

Pulumi 構成は独立したワークスペースパッケージ `@devstone/infra-modggl`（`infra/modggl/`）として管理されており、
`pnpm` / `moon` ワークスペースおよび `pnpm run check:all` の検証対象に含まれます。

### 管理される主なリソース

`modggl:resourcePrefix`（既定: `production` スタック時は `modggl`、それ以外は `modggl-<stack>`）を
プレフィックスとして各リソース名が導出されます（以下は `production` 時の例）。

- **Artifact Registry**: Docker リポジトリ `modggl`（既定リージョン `asia-northeast1`）
- **Service Account**: Cloud Run Job 実行用 `modggl-job-sa`、Cloud Scheduler 起動用 `modggl-scheduler-sa`
- **Secret Manager**: `modggl-toggl-api-token`（`TOGGL_API_TOKEN`）、
  `modggl-discord-webhook-url`（`DISCORD_WEBHOOK_URL`）および `modggl-job-sa` への
  `roles/secretmanager.secretAccessor` 付与
- **Cloud Run Jobs v2**: `modggl`（公開エンドポイントなし、`maxRetries: 0`、環境変数と Secret 参照を設定）
- **Cloud Run Job IAM**: `modggl-scheduler-sa` に最小権限の `roles/run.jobsExecutor`、
  Make OAuth プリンシパルに `roles/run.jobsExecutorWithOverrides` を付与
- **Cloud Scheduler**: `modggl-daily-run`（既定 `0 5 * * *` / `Asia/Tokyo`、`retryCount: 0`）で
  `jobs:run` API へ OAuth POST

### Pulumi 設定キー

| 設定キー                     | 必須 / 任意 | デフォルト値                                           | 説明                                                                    |
| ---------------------------- | ----------- | ------------------------------------------------------ | ----------------------------------------------------------------------- |
| `gcp:project`                | 必須        | -                                                      | デプロイ先の GCP プロジェクト ID                                        |
| `gcp:region`                 | 任意        | `asia-northeast1`                                      | デプロイ先リージョン                                                    |
| `modggl:imageTag`            | 必須        | -                                                      | イミュータブルタグ（例: `v1.0.0`）または `sha256:...` digest            |
| `modggl:togglOrganizationId` | 必須        | -                                                      | 対象の Toggl Organization ID                                            |
| `modggl:togglWorkspaceId`    | 必須        | -                                                      | 対象の Toggl Workspace ID                                               |
| `modggl:makeExecutorMember`  | 必須        | -                                                      | Make 連携用 Google OAuth プリンシパル（例: `user:...@example.com`）     |
| `modggl:schedule`            | 任意        | `0 5 * * *`                                            | Cloud Scheduler の cron 式                                              |
| `modggl:timeZone`            | 任意        | `Asia/Tokyo`                                           | Cloud Scheduler のタイムゾーン                                          |
| `modggl:resourcePrefix`      | 任意        | `modggl`（`production`）/ `modggl-<stack>`（それ以外） | 物理リソース名プレフィックス（SA ID 30 文字制限のため 17 文字以下推奨） |

### セットアップとデプロイ手順

#### 初回構築（Bootstrap）

Cloud Run Job は Artifact Registry のイメージと Secret Manager の `latest` バージョンが存在しないと作成に失敗するため、
初回構築は次の 2 段階で実行します。

1. リポジトリルートで依存関係をインストールし、Docker イメージ（Cloud Run 向けに `linux/amd64` でビルド推奨）を用意します。

   ```bash
   pnpm install
   pnpm run build:modggl
   ```

2. スタック設定ファイルのひな形をコピーし、実環境値を設定します（`infra/*/Pulumi.*.yaml` は `.gitignore` 対象です）。

   ```bash
   cp infra/modggl/Pulumi.production.yaml.example infra/modggl/Pulumi.production.yaml
   cd infra/modggl
   pulumi stack init production
   ```

3. 先行リソース（Artifact Registry、Service Account、空 Secret 容器、Secret IAM）のみを作成します。

   ```bash
   pulumi up \
     --target urn:pulumi:production::modggl::gcp:artifactregistry/repository:Repository::modggl-repository \
     --target urn:pulumi:production::modggl::gcp:serviceaccount/account:Account::modggl-job-sa \
     --target urn:pulumi:production::modggl::gcp:serviceaccount/account:Account::modggl-scheduler-sa \
     --target urn:pulumi:production::modggl::gcp:secretmanager/secret:Secret::toggl-api-token \
     --target urn:pulumi:production::modggl::gcp:secretmanager/secret:Secret::discord-webhook-url \
     --target urn:pulumi:production::modggl::gcp:secretmanager/secretIamMember:SecretIamMember::toggl-api-token-accessor \
     --target urn:pulumi:production::modggl::gcp:secretmanager/secretIamMember:SecretIamMember::discord-webhook-url-accessor
   ```

4. 作成した Artifact Registry へイメージをリタグ＆プッシュし、Secret Manager に実値バージョンを登録します。

   ```bash
   REGISTRY_URL="$(pulumi stack output artifactRegistryUrl)"
   docker tag devstone/modggl:latest "${REGISTRY_URL}/modggl:v1.0.0"
   docker push "${REGISTRY_URL}/modggl:v1.0.0"

   printf '%s' 'your-toggl-api-token' | gcloud secrets versions add modggl-toggl-api-token --data-file=-
   printf '%s' 'https://discord.com/api/webhooks/...' | gcloud secrets versions add modggl-discord-webhook-url --data-file=-
   ```

5. Cloud Run Job と Cloud Scheduler を含めてスタック全体を適用します。

   ```bash
   pulumi preview
   pulumi up
   ```

#### 通常更新

新しいイミュータブルタグでイメージをビルド＆プッシュし、`modggl:imageTag` を更新して適用します。

```bash
cd infra/modggl
pulumi stack select production
pulumi config set modggl:imageTag v1.0.1
pulumi preview
pulumi up
```

## Make からの任意実行（HTTP モジュール）

外部自動化サービス Make（[make.com](https://www.make.com)）の既存 Google OAuth 2.0 接続を利用し、
Cloud Run Jobs v2 の `jobs:run` API を直接呼び出します。
Make 側の OAuth プリンシパルには Pulumi 構成で `roles/run.jobsExecutorWithOverrides` が付与されます。

- **メソッド / URL**:
  `POST https://run.googleapis.com/v2/projects/{project}/locations/{region}/jobs/{jobName}:run`
  （`{jobName}` の既定値は `modggl`。フル URL は `pulumi stack output cloudRunJobRunUri` で取得できます）
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
