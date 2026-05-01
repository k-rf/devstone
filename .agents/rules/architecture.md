# Architecture

> [!NOTE] このファイルの役割
> プロジェクトの技術スタック、ディレクトリ構造、および高レベルな建築指針を記載しています。
> 各詳細については、関連する `rules/*.md` を参照してください。

## プロジェクト概要

本プロジェクトは、pnpm workspaces を活用したモノレポ構成であり、`moon` をタスクランナーとして採用しています。
複数のツールやライブラリを一つの秩序の下に統合し、高い再利用性と一貫性を維持することを目的としています。

## 技術スタック

| カテゴリ               | 技術                                     |
| :--------------------- | :--------------------------------------- |
| **言語**               | TypeScript (ESM)                         |
| **ランタイム**         | Cloudflare Workers / Node.js             |
| **パラダイム**         | Functional Programming (via `Effect-TS`) |
| **Web フレームワーク** | Hono                                     |
| **パッケージ管理**     | pnpm (Workspaces)                        |
| **タスクランナー**     | moon                                     |

## ディレクトリ構造

```plaintext
root/
├── apps/               # アプリケーション本体
│   └── notion-toggl-bridge/  # Cloudflare Workers アプリ
├── packages/           # 共有パッケージ
│   ├── configs/        # ESLint, TypeScript 等の設定
│   ├── design-system/  # UI コンポーネント等（予定）
│   ├── libs/           # 汎用ライブラリ
│   └── plugins/        # Claude / IDE 等のプラグイン
├── .moon/              # moon 構成管理
└── .agents/rules/      # 開発ルール・設計指針（法典）
```

## 建築指針

### Hexagonal Architecture (Ports and Adapters)

ビジネスロジックを外部の関心事（HTTP, API, データベース）から分離します。

- **Core**: ドメイン知識とユースケースを保持。外部を知らず、Port（抽象）のみに依存。
- **Adapter**: Port の具体的な実装（Outbound）および、外部入力のハンドリング（Inbound）を担当。

詳細は [Design Principles](./design-principles.md) を参照してください。

### モジュール責任の分離

| レイヤ           | ディレクトリ            | 主な責務                                                                                          |
| :--------------- | :---------------------- | :------------------------------------------------------------------------------------------------ |
| **Core/Domain**  | `core/domain/`          | 値オブジェクト、エンティティ。                                                                    |
| **Core/App**     | `core/application/`     | ユースケース（Service）の記述。                                                                   |
| **Core/Port**    | `core/port/`            | 各レイヤの抽象（Context.Tag）。                                                                   |
| ∟ **Inbound**    | `core/port/inbound/`    | Service のインターフェース。                                                                      |
| ∟ **Outbound**   | `core/port/outbound/`   | 外部サービス等の抽象。**サービス単位でディレクトリを分割する。**                                  |
| ∟ **Repository** | `core/port/repository/` | 永続化（DB/KV）の抽象。                                                                           |
| **Adapter**      | `adapter/`              | Port の具体的な実装。                                                                             |
| ∟ **Inbound**    | `adapter/inbound/`      | リクエストの受付（HTTP Handler 等）。                                                             |
| ∟ **Outbound**   | `adapter/outbound/`     | 外部サービス等の実装。**技術（HTTP/KV等）ではなく、接続先サービス単位でディレクトリを分割する。** |
| ∟ **Repository** | `adapter/repository/`   | DB/KV 等への具体的なアクセス実装。                                                                |

## 開発フロー

- **Task Runner**: `moon <task>` を通じて一貫した実行環境を提供します。詳細は [Commands](./commands.md) を参照。
- **Quality Control**: 静的解析と自動整形を徹底。詳細は [Code Quality](./code-quality.md) を参照。
- **Verification**: 階層化されたテスト戦略を採用。詳細は [Testing](./testing.md) を参照。
