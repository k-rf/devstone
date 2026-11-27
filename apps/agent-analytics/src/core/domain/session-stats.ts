import { Schema } from "effect";

/**
 * セッション内で実行された単一のツール呼び出しエントリ。
 */
export const ToolCallEntry = Schema.Struct({
  toolName: Schema.NonEmptyString,
  targetPath: Schema.optional(Schema.String),
});

export type ToolCallEntry = typeof ToolCallEntry.Type;

/**
 * 名前ごとの集計カウント項目。
 */
export const UsageCountItem = Schema.Struct({
  name: Schema.NonEmptyString,
  count: Schema.Number.pipe(Schema.int(), Schema.positive()),
});

export type UsageCountItem = typeof UsageCountItem.Type;

/**
 * 単一セッションのスキル発動回数およびツール使用回数の統計。
 */
export const SessionStats = Schema.Struct({
  skills: Schema.Array(UsageCountItem),
  tools: Schema.Array(UsageCountItem),
});

export type SessionStats = typeof SessionStats.Type;
