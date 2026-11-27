import { TimeInterval } from "@devstone/libs-time-interval";
import { Schema } from "effect";

/**
 * 正規化されたタイムエントリーを表すドメインスキーマ
 */
export const TimeEntry = Schema.Struct({
  id: Schema.Number,
  interval: TimeInterval,
  type: Schema.Literal("activity", "break"),
  taskId: Schema.OptionFromSelf(Schema.Number),
  projectId: Schema.OptionFromSelf(Schema.Number),
  clientId: Schema.OptionFromSelf(Schema.Number),
  description: Schema.String,
  tagIds: Schema.Array(Schema.Number),
  billable: Schema.Boolean,
  hasScheduleBinding: Schema.Boolean,
});

/**
 * 正規化されたタイムエントリーのドメイン型
 */
export type TimeEntry = typeof TimeEntry.Type;
