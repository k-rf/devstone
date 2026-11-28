import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { Toggl2TimeEntryStreamItem } from "@devstone/libs-toggl-2-sdk";
import { Option, Schema } from "effect";
import { expect, it } from "vitest";

import { ClientId } from "../../../core/domain/client-id.js";
import { ProjectId } from "../../../core/domain/project-id.js";
import { TagId } from "../../../core/domain/tag-id.js";
import { TaskId } from "../../../core/domain/task-id.js";
import { TimeEntryId } from "../../../core/domain/time-entry-id.js";

import { mapStreamItemsToTimeEntries } from "./toggl-2.mapper.js";

const makeStreamItem = (overrides: Record<string, unknown>): Toggl2TimeEntryStreamItem =>
  Schema.decodeUnknownSync(Toggl2TimeEntryStreamItem)({
    id: 1,
    start: "2026-11-27T09:00:00Z",
    duration: 3600,
    ...overrides,
  });

it("適格なタイムエントリーをドメインモデルへ正規化し除外件数を計上すること", () => {
  const valid = makeStreamItem({
    id: 10,
    start: "2026-11-27T09:00:00+09:00",
    duration: 1800,
    type: "break",
    task_id: 5,
    project_id: 6,
    project: { id: 6, client: { id: 70 } },
    description: "休憩",
    tags: [{ id: 30 }, { id: 10 }, { id: 30 }, { id: 20 }],
    billable: true,
    planned_start: "2026-11-27T09:00:00+09:00",
  });
  const zeroDuration = makeStreamItem({
    id: 11,
    start: "2026-11-27T10:00:00Z",
    duration: 0,
  });

  const excludedItems: readonly Toggl2TimeEntryStreamItem[] = [
    makeStreamItem({ id: 1, start: undefined }),
    makeStreamItem({ id: 2, duration: undefined }),
    makeStreamItem({ id: 3, duration: -1 }),
    makeStreamItem({ id: 4, start: "invalid-date" }),
    makeStreamItem({ id: 5, deleted_at: "2026-11-27T10:00:00Z" }),
    makeStreamItem({ id: 6, archived_at: "2026-11-27T10:00:00Z" }),
    makeStreamItem({ id: 7, draft: true }),
    makeStreamItem({ id: 8, pattern_managed: true }),
    makeStreamItem({ id: 9, lock_reason: "time_entry_invoiced" }),
    { ...makeStreamItem({ id: 12 }), duration: Option.some(Number.NaN) },
    { ...makeStreamItem({ id: 13 }), duration: Option.some(Number.POSITIVE_INFINITY) },
  ];

  const result = mapStreamItemsToTimeEntries([valid, zeroDuration, ...excludedItems]);

  expect(result.fetchedCount).toBe(13);
  expect(result.excludedCount).toBe(11);
  expect(result.entries).toStrictEqual([
    {
      id: TimeEntryId.make(10),
      interval: TimeInterval.make({
        start: TimeInstant.make(Date.parse("2026-11-27T09:00:00+09:00")),
        end: TimeInstant.make(Date.parse("2026-11-27T09:00:00+09:00") + 1_800_000),
      }),
      type: "break",
      taskId: Option.some(TaskId.make(5)),
      projectId: Option.some(ProjectId.make(6)),
      clientId: Option.some(ClientId.make(70)),
      description: "休憩",
      tagIds: [TagId.make(10), TagId.make(20), TagId.make(30)],
      billable: true,
      hasScheduleBinding: true,
    },
    {
      id: TimeEntryId.make(11),
      interval: TimeInterval.make({
        start: TimeInstant.make(Date.parse("2026-11-27T10:00:00Z")),
        end: TimeInstant.make(Date.parse("2026-11-27T10:00:00Z")),
      }),
      type: "activity",
      taskId: Option.none(),
      projectId: Option.none(),
      clientId: Option.none(),
      description: "",
      tagIds: [],
      billable: false,
      hasScheduleBinding: false,
    },
  ]);
});

it("サブ秒を含む start と小数 duration を秒単位へ切り捨て正規化すること", () => {
  const first = makeStreamItem({
    id: 1,
    start: "2026-11-27T09:00:00.200Z",
    duration: 60.9,
  });
  const second = makeStreamItem({
    id: 2,
    start: "2026-11-27T09:01:00.900Z",
    duration: 60,
  });

  const result = mapStreamItemsToTimeEntries([first, second]);

  expect(result.entries[0]?.interval).toStrictEqual(
    TimeInterval.make({
      start: TimeInstant.make(Date.parse("2026-11-27T09:00:00.000Z")),
      end: TimeInstant.make(Date.parse("2026-11-27T09:01:00.000Z")),
    }),
  );
  expect(result.entries[1]?.interval).toStrictEqual(
    TimeInterval.make({
      start: TimeInstant.make(Date.parse("2026-11-27T09:01:00.000Z")),
      end: TimeInstant.make(Date.parse("2026-11-27T09:02:00.000Z")),
    }),
  );
});

it("taskId・projectId・clientId のフォールバックと競合時の優先順位を仕様通りに解決すること", () => {
  const topLevelWins = makeStreamItem({
    id: 1,
    task_id: 10,
    project_id: 20,
    project: { id: 21, client: { id: 30 } },
    task: {
      id: 11,
      project_id: 22,
      project: { id: 23, client: { id: 31 } },
      client: { id: 32 },
    },
  });
  const nestedProjectWins = makeStreamItem({
    id: 2,
    project: { id: 21 },
    task: {
      id: 100,
      project_id: 22,
      project: { id: 23, client: { id: 31 } },
      client: { id: 32 },
    },
  });
  const taskProjectIdWins = makeStreamItem({
    id: 3,
    task: {
      id: 101,
      project_id: 200,
      project: { id: 201, client: { id: 300 } },
      client: { id: 999 },
    },
  });
  const taskNestedProjectWins = makeStreamItem({
    id: 4,
    task: {
      id: 102,
      project: { id: 202 },
      client: { id: 301 },
    },
    planned_duration: 1800,
  });
  const fromCalendarEvent = makeStreamItem({
    id: 5,
    calendar_event_id: 777,
  });
  const plain = makeStreamItem({ id: 6 });

  const result = mapStreamItemsToTimeEntries([
    topLevelWins,
    nestedProjectWins,
    taskProjectIdWins,
    taskNestedProjectWins,
    fromCalendarEvent,
    plain,
  ]);

  expect(result.entries[0]).toMatchObject({
    id: TimeEntryId.make(1),
    taskId: Option.some(TaskId.make(10)),
    projectId: Option.some(ProjectId.make(20)),
    clientId: Option.some(ClientId.make(30)),
  });
  expect(result.entries[1]).toMatchObject({
    id: TimeEntryId.make(2),
    taskId: Option.some(TaskId.make(100)),
    projectId: Option.some(ProjectId.make(21)),
    clientId: Option.some(ClientId.make(31)),
  });
  expect(result.entries[2]).toMatchObject({
    id: TimeEntryId.make(3),
    taskId: Option.some(TaskId.make(101)),
    projectId: Option.some(ProjectId.make(200)),
    clientId: Option.some(ClientId.make(300)),
    description: "",
    tagIds: [],
    billable: false,
    hasScheduleBinding: false,
  });
  expect(result.entries[3]).toMatchObject({
    id: TimeEntryId.make(4),
    taskId: Option.some(TaskId.make(102)),
    projectId: Option.some(ProjectId.make(202)),
    clientId: Option.some(ClientId.make(301)),
    hasScheduleBinding: true,
  });
  expect(result.entries[4]?.hasScheduleBinding).toBe(true);
  expect(result.entries[5]).toMatchObject({
    id: TimeEntryId.make(6),
    taskId: Option.none(),
    projectId: Option.none(),
    clientId: Option.none(),
    hasScheduleBinding: false,
  });
});

it("(start ASC, end ASC, id ASC) の順序で決定論的にソートすること", () => {
  const e1 = makeStreamItem({ id: 20, start: "2026-11-27T09:00:00Z", duration: 600 });
  const e2 = makeStreamItem({ id: 10, start: "2026-11-27T09:00:00Z", duration: 600 });
  const e3 = makeStreamItem({ id: 5, start: "2026-11-27T09:00:00Z", duration: 300 });
  const e4 = makeStreamItem({ id: 1, start: "2026-11-27T08:00:00Z", duration: 600 });

  const result = mapStreamItemsToTimeEntries([e1, e2, e3, e4]);

  expect(result.entries.map((entry) => entry.id)).toStrictEqual([1, 5, 10, 20]);
});
