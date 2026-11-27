import { Schema } from "effect";

/**
 * Toggl 2.0 API のタイムエントリー一括部分更新項目スキーマ
 */
export const BulkUpdateTimeEntryItem = Schema.Struct({
  id: Schema.Number,
  start: Schema.optionalWith(Schema.String, { as: "Option", exact: true }),
  duration: Schema.optionalWith(Schema.Number, { as: "Option", exact: true }),
});

/**
 * Toggl 2.0 API のタイムエントリー一括部分更新項目型
 */
export type BulkUpdateTimeEntryItem = typeof BulkUpdateTimeEntryItem.Type;
