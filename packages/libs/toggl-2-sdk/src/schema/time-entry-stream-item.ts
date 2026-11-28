import { Schema } from "effect";

import { Toggl2TimeEntryId } from "./time-entry-id.js";

const optionalOption = <S extends Schema.Schema.All>(schema: S) =>
  Schema.optionalWith(schema, { as: "Option", nullable: true });

const TimeEntryClient = Schema.Struct({
  id: Schema.Number,
  name: optionalOption(Schema.String),
});

const TimeEntryProject = Schema.Struct({
  id: Schema.Number,
  name: optionalOption(Schema.String),
  client: optionalOption(TimeEntryClient),
});

const TimeEntryTask = Schema.Struct({
  id: Schema.Number,
  name: optionalOption(Schema.String),
  projectId: optionalOption(Schema.Number).pipe(Schema.fromKey("project_id")),
  project: optionalOption(TimeEntryProject),
  client: optionalOption(TimeEntryClient),
});

const TimeEntryTag = Schema.Struct({
  id: Schema.Number,
  name: optionalOption(Schema.String),
});

/**
 * Toggl 2.0 API のタイムエントリーストリーム項目スキーマ
 */
export const Toggl2TimeEntryStreamItem = Schema.Struct({
  id: Toggl2TimeEntryId,
  start: optionalOption(Schema.String),
  duration: optionalOption(Schema.Number),
  deletedAt: optionalOption(Schema.String).pipe(Schema.fromKey("deleted_at")),
  archivedAt: optionalOption(Schema.String).pipe(Schema.fromKey("archived_at")),
  draft: Schema.optionalWith(Schema.Boolean, { default: () => false, nullable: true }),
  patternManaged: Schema.optionalWith(Schema.Boolean, {
    default: () => false,
    nullable: true,
  }).pipe(Schema.fromKey("pattern_managed")),
  lockReason: optionalOption(Schema.String).pipe(Schema.fromKey("lock_reason")),
  type: Schema.optionalWith(Schema.Literal("activity", "break"), {
    default: () => "activity" as const,
    nullable: true,
  }),
  taskId: optionalOption(Schema.Number).pipe(Schema.fromKey("task_id")),
  projectId: optionalOption(Schema.Number).pipe(Schema.fromKey("project_id")),
  task: optionalOption(TimeEntryTask),
  project: optionalOption(TimeEntryProject),
  description: optionalOption(Schema.String),
  tags: Schema.optionalWith(Schema.Array(TimeEntryTag), {
    default: () => [],
    nullable: true,
  }),
  billable: optionalOption(Schema.Boolean),
  plannedStart: optionalOption(Schema.String).pipe(Schema.fromKey("planned_start")),
  plannedDuration: optionalOption(Schema.Number).pipe(Schema.fromKey("planned_duration")),
  calendarEventId: optionalOption(Schema.Number).pipe(Schema.fromKey("calendar_event_id")),
});

/**
 * Toggl 2.0 API のタイムエントリーストリーム項目型
 */
export type Toggl2TimeEntryStreamItem = typeof Toggl2TimeEntryStreamItem.Type;

/**
 * Toggl 2.0 API のタイムエントリーに紐づくクライアント型
 */
export type Toggl2TimeEntryClient = typeof TimeEntryClient.Type;

/**
 * Toggl 2.0 API のタイムエントリーに紐づくプロジェクト型
 */
export type Toggl2TimeEntryProject = typeof TimeEntryProject.Type;

/**
 * Toggl 2.0 API のタイムエントリーに紐づくタスク型
 */
export type Toggl2TimeEntryTask = typeof TimeEntryTask.Type;

/**
 * Toggl 2.0 API のタイムエントリーに紐づくタグ型
 */
export type Toggl2TimeEntryTag = typeof TimeEntryTag.Type;
