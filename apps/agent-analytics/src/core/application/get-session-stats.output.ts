import { Schema } from "effect";

import { SessionStats } from "../domain/session-stats.js";

/**
 * セッション統計取得 Workflow の出力スキーマ。
 */
export const GetSessionStatsOutput = Schema.Struct({
  stats: SessionStats,
  statusLine: Schema.NonEmptyString,
});

export type GetSessionStatsOutput = typeof GetSessionStatsOutput.Type;
