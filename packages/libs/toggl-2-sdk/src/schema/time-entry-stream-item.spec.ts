/* eslint-disable unicorn/no-null -- 外部 API の JSON レスポンスに含まれる null をテストで再現するため */
import { Option, Schema } from "effect";
import { expect, it } from "vitest";

import { TimeEntryStreamItem } from "./time-entry-stream-item.js";

it("全フィールドを含む JSON を Option と camelCase に正規化してデコードできること", () => {
  const raw = {
    id: 1,
    start: "2026-11-27T09:00:00+09:00",
    duration: 3600,
    deleted_at: "2026-11-27T12:00:00+09:00",
    archived_at: "2026-11-27T13:00:00+09:00",
    draft: true,
    pattern_managed: true,
    lock_reason: "time_entry_invoiced",
    type: "break",
    task_id: 20,
    project_id: 30,
    task: {
      id: 20,
      name: "実装タスク",
      project_id: 30,
      project: {
        id: 30,
        name: "メインプロジェクト",
        client: {
          id: 40,
          name: "株式会社テスト",
        },
      },
      client: {
        id: 41,
        name: "タスク直接クライアント",
      },
    },
    project: {
      id: 30,
      name: "メインプロジェクト",
      client: {
        id: 40,
        name: "株式会社テスト",
      },
    },
    description: "作業ログ",
    tags: [
      { id: 100, name: "開発" },
      { id: 200, name: null },
    ],
    billable: true,
    planned_start: "2026-11-27T09:00:00+09:00",
    planned_duration: 3600,
    calendar_event_id: 500,
  };

  const decoded = Schema.decodeUnknownSync(TimeEntryStreamItem)(raw);

  expect(decoded).toStrictEqual({
    id: 1,
    start: Option.some("2026-11-27T09:00:00+09:00"),
    duration: Option.some(3600),
    deletedAt: Option.some("2026-11-27T12:00:00+09:00"),
    archivedAt: Option.some("2026-11-27T13:00:00+09:00"),
    draft: true,
    patternManaged: true,
    lockReason: Option.some("time_entry_invoiced"),
    type: "break",
    taskId: Option.some(20),
    projectId: Option.some(30),
    task: Option.some({
      id: 20,
      name: Option.some("実装タスク"),
      projectId: Option.some(30),
      project: Option.some({
        id: 30,
        name: Option.some("メインプロジェクト"),
        client: Option.some({
          id: 40,
          name: Option.some("株式会社テスト"),
        }),
      }),
      client: Option.some({
        id: 41,
        name: Option.some("タスク直接クライアント"),
      }),
    }),
    project: Option.some({
      id: 30,
      name: Option.some("メインプロジェクト"),
      client: Option.some({
        id: 40,
        name: Option.some("株式会社テスト"),
      }),
    }),
    description: Option.some("作業ログ"),
    tags: [
      { id: 100, name: Option.some("開発") },
      { id: 200, name: Option.none() },
    ],
    billable: Option.some(true),
    plannedStart: Option.some("2026-11-27T09:00:00+09:00"),
    plannedDuration: Option.some(3600),
    calendarEventId: Option.some(500),
  });
});

it("任意フィールドが省略された JSON を既定値および Option.none に正規化できること", () => {
  const decoded = Schema.decodeUnknownSync(TimeEntryStreamItem)({ id: 2 });

  expect(decoded).toStrictEqual({
    id: 2,
    start: Option.none(),
    duration: Option.none(),
    deletedAt: Option.none(),
    archivedAt: Option.none(),
    draft: false,
    patternManaged: false,
    lockReason: Option.none(),
    type: "activity",
    taskId: Option.none(),
    projectId: Option.none(),
    task: Option.none(),
    project: Option.none(),
    description: Option.none(),
    tags: [],
    billable: Option.none(),
    plannedStart: Option.none(),
    plannedDuration: Option.none(),
    calendarEventId: Option.none(),
  });
});

it("null を含む JSON フィールドが Option.none および既定値に正規化されること", () => {
  const decoded = Schema.decodeUnknownSync(TimeEntryStreamItem)({
    id: 3,
    start: null,
    duration: null,
    deleted_at: null,
    archived_at: null,
    draft: null,
    pattern_managed: null,
    lock_reason: null,
    type: null,
    task_id: null,
    project_id: null,
    task: null,
    project: null,
    description: null,
    tags: null,
    billable: null,
    planned_start: null,
    planned_duration: null,
    calendar_event_id: null,
  });

  expect(decoded).toStrictEqual({
    id: 3,
    start: Option.none(),
    duration: Option.none(),
    deletedAt: Option.none(),
    archivedAt: Option.none(),
    draft: false,
    patternManaged: false,
    lockReason: Option.none(),
    type: "activity",
    taskId: Option.none(),
    projectId: Option.none(),
    task: Option.none(),
    project: Option.none(),
    description: Option.none(),
    tags: [],
    billable: Option.none(),
    plannedStart: Option.none(),
    plannedDuration: Option.none(),
    calendarEventId: Option.none(),
  });
});

it.each([
  { label: "id が文字列", payload: { id: "bad" } },
  { label: "type が不正なリテラル", payload: { id: 1, type: "unknown" } },
  { label: "duration が文字列", payload: { id: 1, duration: "60" } },
  { label: "tags 要素の id が文字列", payload: { id: 1, tags: [{ id: "bad" }] } },
])("不正なペイロード（$label）は Schema.decodeUnknownSync で失敗すること", ({ payload }) => {
  expect(() => Schema.decodeUnknownSync(TimeEntryStreamItem)(payload)).toThrow();
});
