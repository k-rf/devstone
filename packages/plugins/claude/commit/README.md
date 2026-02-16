# Commit Plugin

差分の妥当性チェック・コミット計画・メッセージ生成・実行の一連のワークフローを提供する Claude Code プラグイン。

## 機能

- **差分レビュー**: 変更の妥当性を自動検証（セキュリティ・整合性・完全性）
- **コミット計画**: 単一責任原則と依存関係順序に基づくコミット分割
- **メッセージ生成**: gitmoji / Conventional Commits 対応、追加プレフィックス（チケットキー等）対応
- **インタラクティブ実行**: ステップごとにユーザー確認を挟むインタラクティブ実行

## 使い方

```plaintext
/commit
```

## 設定

プロジェクトルートに `.claude/configs/commit.json` を作成して設定をカスタマイズできる。

JSON Schema が `schemas/commit.schema.json` に提供されており、`$schema` フィールドで参照することで
エディタの入力補完・バリデーションが有効になる。

```json
{
  "$schema": "../../packages/plugins/claude/commit/schemas/commit.schema.json",
  "style": "gitmoji",
  "language": "en",
  "scope": false
}
```

> `$schema` のパスはプロジェクト構成に応じて調整する。
> VS Code のワークスペース設定 `json.schemas` で一括設定することも可能。

### フィールド

| フィールド     | デフォルト | 説明                                                    |
| -------------- | ---------- | ------------------------------------------------------- |
| `style`        | `gitmoji`  | コミットメッセージのスタイル: `gitmoji`、`conventional` |
| `language`     | `en`       | メッセージの言語: `en`、`ja` 等                         |
| `scope`        | `false`    | スコープをメッセージに含めるか                          |
| `customPrefix` | —          | 追加プレフィックス（例: チケットキー `PROJ-123`）       |

## コンポーネント

### スキル

- **commit** (`/commit`) — ワークフローのエントリーポイント（差分レビュー → 計画 → 実行）
- **commit-message** — コミットメッセージの規約・スタイルに関する知識を提供

### エージェント

- **diff-reviewer** — 差分の妥当性を検証し、問題点を報告する
- **commit-planner** — 単一責任原則と依存関係を考慮してコミット計画を立案する
