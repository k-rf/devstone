import { Schema } from "effect";

/**
 * Toggl 2.0 タイムエントリー ID（正の整数）を表すブランド付きスキーマ
 */
export const Toggl2TimeEntryId = Schema.Int.pipe(
  Schema.positive(),
  Schema.brand("Toggl2TimeEntryId", {
    identifier: "Toggl2TimeEntryId",
    description: "Toggl 2.0 のタイムエントリー ID（正の整数）",
  }),
);

/**
 * Toggl 2.0 タイムエントリー ID を表すブランド型
 */
export type Toggl2TimeEntryId = typeof Toggl2TimeEntryId.Type;
