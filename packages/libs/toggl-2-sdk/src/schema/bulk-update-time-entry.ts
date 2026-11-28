import { Option, Schema } from "effect";

import { Toggl2TimeEntryId } from "./time-entry-id.js";

/**
 * Toggl 2.0 API のタイムエントリー一括部分更新項目スキーマ
 */
export const Toggl2BulkUpdateTimeEntryItem = Schema.Struct({
  id: Toggl2TimeEntryId,
  start: Schema.optionalWith(Schema.String, { as: "Option", exact: true }),
  duration: Schema.optionalWith(Schema.Number, { as: "Option", exact: true }),
}).pipe(
  Schema.filter((item) =>
    Option.isSome(item.start) || Option.isSome(item.duration)
      ? true
      : "start または duration のいずれか 1 つ以上を指定する必要があります",
  ),
);

/**
 * Toggl 2.0 API のタイムエントリー一括部分更新項目型
 */
export type Toggl2BulkUpdateTimeEntryItem = typeof Toggl2BulkUpdateTimeEntryItem.Type;
