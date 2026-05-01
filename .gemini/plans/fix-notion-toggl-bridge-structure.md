# 計画: notion-toggl-bridge のアーキテクチャ再編と命名規則の修正

## 目的

`notion-toggl-bridge` アプリケーションを、プロジェクトの設計指針（ヘキサゴナルアーキテクチャ）と命名規則に厳密に適合させる。
関心事の分離を徹底し、サービス単位のディレクトリ構造に再編することで、保守性と見通しを向上させる。

## 主要ファイルとコンテキスト

- **コア・ポート**: `src/core/port/*.ts`
- **コア・ドメイン**: `src/core/domain/normalize-rich-text.ts`, `split-category.ts`
- **アダプター**: `src/adapter/inbound/http/*`, `src/adapter/outbound/*`

## 実装ステップ

### フェーズ 1: ポート層の再編成

1. **サービス別のポートディレクトリ作成**:
   - `src/core/port/outbound/{notion,toggl,slack,cloudflare,infrastructure}/` を作成。
2. **ポートの移動**:
   - `task-board.port.ts` -> `outbound/notion/task-board.port.ts`
   - `time-tracker.port.ts` -> `outbound/toggl/time-tracker.port.ts`
   - `notification.port.ts` -> `outbound/slack/notification.port.ts`
   - `cache.port.ts` -> `outbound/cloudflare/cache.port.ts`
   - `env.port.ts` -> `outbound/infrastructure/env.port.ts`

### フェーズ 2: アダプター層の再編成

1. **インバウンド・アダプター**:
   - `src/adapter/inbound/http/webhook.request.ts`
     -> `src/adapter/inbound/http/webhook.payload.ts` へリネーム。
2. **アウトバウンド・アダプター (サービス指向)**:
   - `src/adapter/outbound/{notion,toggl,slack,cloudflare}/` を作成。
   - **Notion**:
     - `notion.adapter.ts` を `notion/` へ移動。
     - `NotionPagePayload` を `notion/notion.payload.ts` として抽出。
     - `src/core/domain/normalize-rich-text.ts` -> `notion/notion.util.ts` へ移動。
   - **Toggl**:
     - `toggl-track.adapter.ts` を `toggl/` へ移動。
     - `src/core/domain/split-category.ts` -> `toggl/toggl.util.ts` へ移動。
   - **Slack**:
     - `slack.adapter.ts` を `slack/` へ移動。
   - **Cloudflare**:
     - `kv/kv.adapter.ts` -> `cloudflare/kv.adapter.ts` へ移動。

### フェーズ 3: インポートの更新と検証

1. **参照の修正**:
   - `webhook.handler.ts`, `start-toggl-timer.service.ts`, `index.ts`, および各アダプター内のインポートパスをすべて修正。
2. **Lint と型チェック**:
   - `moon run notion-toggl-bridge:typecheck` および `lint` を実行し、正しく結合されていることを確認。

### フェーズ 4: テストの追加

1. **ユニットテスト**:
   - `src/core/domain/task-board-item-id.spec.ts`
   - `src/adapter/outbound/toggl/toggl.util.spec.ts`
2. **結合テスト**:
   - `src/core/application/start-toggl-timer.service.spec.ts`

## 検証とテスト

- `moon run notion-toggl-bridge:test` がパスすること。
- ディレクトリ構造が意図通りに整理されていることを目視で確認。
