# @devstone/agent-analytics

Antigravity の会話ログ（トランスクリプト）からエージェントスキルの利用統計・発火理由・
サブリソース到達率を集計して可視化するアプリケーションです。

## 主な機能（予定）

1. **CLI `statusLine` 連携**
   - 実行中セッションの作業停止時に、そのセッション内で呼び出したスキルごとの回数と
     利用したツールごとの回数を集計し、CLI のステータスライン（`statusLine`）向けに
     1 行のサマリとして出力します。
2. **Web UI ダッシュボード**
   - 全セッションのログとメタデータを横断して集計し、以下の指標をブラウザ上で可視化します。
     - スキル別の呼び出し回数・利用ランキング
     - 死蔵スキル（`.agents/skills/` に定義されているが未呼び出しのスキル）の特定
     - セッション別履歴・ワークスペース別フィルタリング
     - トリガープロンプト（スキル発火直前の `USER_INPUT`）の逆引き一覧
     - スキル内の `references/`・`scripts/` 到達率

## データソースと設計方針

- **会話メタデータ**: `conversation_summaries.db`（`node:sqlite` で参照）
- **実行ログ**: `brain/<id>/.system_generated/logs/transcript.jsonl`
  （`truncated_fields` に `"tool_calls"` を含むステップは `transcript_full.jsonl` の該当行を参照）
- **スキル定義**: `.agents/skills/` 配下の `SKILL.md` および `references/`・`scripts/`
- **技術制約**: 外部 DB エンジン（DuckDB 等）は使用せず、Node.js 標準機能（`node:sqlite`,
  `node:fs` 等）と `Effect-TS`（`Effect.Schema` 等）のみで型安全に実装します。
