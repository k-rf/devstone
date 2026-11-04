import { Schema } from "effect";

/**
 * セッション統計取得 Workflow の入力スキーマ。
 */
export const GetSessionStatsInput = Schema.Struct({
  transcriptPath: Schema.NonEmptyString,
});

export type GetSessionStatsInput = typeof GetSessionStatsInput.Type;
