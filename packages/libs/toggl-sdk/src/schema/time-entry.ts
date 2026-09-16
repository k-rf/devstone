import { Schema } from "effect";

/**
 * Toggl API のタイムエントリー作成ペイロード
 */
export const TogglTimeEntry = Schema.Struct({
  description: Schema.String,
  project_id: Schema.optional(Schema.NullOr(Schema.Number)),
  tags: Schema.Array(Schema.String),
  workspace_id: Schema.Number,
  start: Schema.String,
  duration: Schema.Number,
  created_with: Schema.String,
});

/**
 * Toggl API のタイムエントリー作成ペイロード型
 */
export type TogglTimeEntry = typeof TogglTimeEntry.Type;
