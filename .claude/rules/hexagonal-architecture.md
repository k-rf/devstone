# Hexagonal Architecture (Port and Adapter) Rules

## 基本方針

ポートアンドアダプター（六角形アーキテクチャ）を採用する。

- `core/` に最も重要なビジネスロジックを閉じ込める
- `adapter/` は `inbound/` と `outbound/` に分割する
- **依存の方向は外→内（adapter → core）のみ。core は adapter を知らない**

## ディレクトリ構造

```
src/
├── core/
│   ├── domain/       # 値オブジェクト・エンティティ
│   ├── application/  # Service（ユースケース）・input/output 型
│   └── port/         # Port（Context.Tag）・Env インターフェース
└── adapter/
    ├── inbound/      # HTTP ルート・ミドルウェア・Webhook ペイロード
    │   └── http/
    └── outbound/     # 外部 API クライアント・KV アダプター
```

## adapter/inbound に HTTP を含める理由

HTTP は外部からの入力トリガーであり、スケール時に他の inbound（キュー、gRPC 等）と一貫して扱えるようにするため。

## 型ファイルの命名規則

| ファイル種別 | 場所 | 意味 |
|---|---|---|
| `*.payload.ts` | `adapter/inbound/` | 外から来る Webhook ペイロードの型（Effect Schema） |
| `*.request.ts` | `adapter/outbound/` | 外部 API に送るリクエストボディの型 |
| `*.response.ts` | `adapter/outbound/` | 外部 API が返すレスポンスの型（Effect Schema） |
| `*.input.ts` | `core/application/` | Service への入力型（Effect Schema） |
| `*.output.ts` | `core/application/` | Service からの出力型 |

## マッパーの配置原則

マッパー（型変換）は **adapter 側** に置く。

- `payload → input` 変換: `adapter/inbound/` に置く
- `response → output` 変換: `adapter/outbound/` に置く
- `output → request` 変換: `adapter/outbound/` に置く
- **core はマッパーを知らない**

## 禁止事項

- `core/` から `adapter/` を import してはならない
- ルートハンドラに認証ロジックを混在させてはならない（ミドルウェアに分離する）
- adapter 層が core の型を直接変更してはならない（マッパー経由で変換する）
