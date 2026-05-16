---
name: notion-context-sync
description: ntnコマンドを使用してNotionと開発コンテキストを同期します。仕様の検索、ドキュメント取得、進捗更新が必要な時に使用してください。情報の参照はまず ntn --help を優先し、解決しない場合のみ notion-developers MCP を使用します。
---

# Notion Context Sync

`ntn` コマンドを主軸に据えた「CLI-first」な手法で、コードベースと Notion ドキュメントを橋渡しするためのワークフロー。

## ツール使い分けの指針

- **実行 (`ntn`)**: Notion ワークスペースへの直接操作（検索、取得、更新）に使用すること。
- **参照 (優先度1: `ntn --help` / `ntn <subcommand> --help`)**: コマンドの使い方は、まず各サブコマンドの `--help` で確認すること。
- **参照 (優先度2: `ntn api ls`)**: 使用可能な API エンドポイントの確認には、まずこのコマンドを使用すること。
- **参照 (優先度3: `notion-developers` MCP)**: 上記の手段で解決しない場合のみ、API の正確な仕様や OpenAPI スペックを確認するために使用すること。

## ユースケースの例

状況に応じて、以下の操作を組み合わせて、あるいは独立して実行すること。

### 情報の探索 (Search)

実装要件、設計書、ミーティングノートを探索する。

```bash
# キーワードでページを検索
ntn api v1/search query="検索キーワード"
```

_※ 呼び出し方が不明な場合は、まず `ntn api --help` や `ntn api v1/search --help` を実行すること。_

### コンテキストの読み込み (Read)

ページ ID から内容を取得し、Markdown として理解する。

```bash
# ページ内容を Markdown で取得
ntn pages get <page-id>
```

**所作の規律:**

- フロントマターのメタデータ（Status, Type等）を必ず確認すること。
- Notion の意図を、設計や実装の判断材料として取り入れること。

### 進捗と知見の同期 (Update)

実装状況や技術メモを Notion に書き戻す。

```bash
# ページ内容を更新
ntn pages update <page-id> --content "## 実装メモ\n\n- 〇〇を実装"
```

**ヒント:** プロパティ更新（ステータス変更等）には `ntn api` を使用すること。

```bash
ntn api v1/pages/<page-id> -X PATCH properties[Status][status][name]="Done"
```

## 参照コマンド集

| 目的           | コマンドパターン                           |
| :------------- | :----------------------------------------- |
| **基本ヘルプ** | `ntn --help` / `ntn <subcommand> --help`   |
| **API一覧**    | `ntn api ls`                               |
| **検索**       | `ntn api v1/search query="..."`            |
| **取得**       | `ntn pages get <id>`                       |
| **更新**       | `ntn pages update <id> --content "..."`    |
| **最終手段**   | `mcp_notion-developers_search_notion_docs` |

## 設計指針

1. **再現性を優先する**: MCP 経由の隠蔽された操作より、`ntn` による明示的な操作を優先すること。
2. **手元の情報を使い切る**: 呼び出し方に迷った際は、まず `--help` や `ntn api ls` を徹底的に確認すること。
3. **正確性を最終確認する**: 上記で解決しない場合のみ、MCP で公式ドキュメントを確認すること。
4. **追跡可能性を残す**: コミットメッセージやコードコメントで Notion のページ ID (UUID) に言及し、情報の背景を辿れるようにすること。ただし、機密情報の露出を避けるため、公開リポジトリではページタイトルの記述は避け、IDのみによる言及に留めること。
