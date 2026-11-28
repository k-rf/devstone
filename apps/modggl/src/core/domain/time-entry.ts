import { TimeInterval } from "@devstone/libs-time-interval";
import { Schema } from "effect";

import { ClientId } from "./client-id.js";
import { ProjectId } from "./project-id.js";
import { TagId } from "./tag-id.js";
import { TaskId } from "./task-id.js";
import { TimeEntryId } from "./time-entry-id.js";

/**
 * 正規化されたタイムエントリーを表すドメインスキーマ
 */
export const TimeEntry = Schema.Struct({
  id: TimeEntryId,
  interval: TimeInterval,
  type: Schema.Literal("activity", "break"),
  taskId: Schema.OptionFromSelf(TaskId),
  projectId: Schema.OptionFromSelf(ProjectId),
  clientId: Schema.OptionFromSelf(ClientId),
  description: Schema.String,
  tagIds: Schema.Array(TagId),
  billable: Schema.Boolean,
  hasScheduleBinding: Schema.Boolean,
});

/**
 * 正規化されたタイムエントリーのドメイン型
 */
export type TimeEntry = typeof TimeEntry.Type;
