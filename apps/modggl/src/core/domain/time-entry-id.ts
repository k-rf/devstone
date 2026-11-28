import { Schema } from "effect";

/**
 * タイムエントリー ID（正の整数）を表すブランド付きスキーマ
 */
export const TimeEntryId = Schema.Int.pipe(
  Schema.positive(),
  Schema.brand("TimeEntryId", {
    identifier: "TimeEntryId",
    description: "タイムエントリー ID（正の整数）",
  }),
);

/**
 * タイムエントリー ID を表すブランド型
 */
export type TimeEntryId = typeof TimeEntryId.Type;
