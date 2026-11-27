import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { TimeEntryStreamItem } from "@devstone/libs-toggl-2-sdk";
import { Option, Schema } from "effect";
import { expect, it } from "vitest";

import { mapStreamItemsToTimeEntries } from "./toggl-2.mapper.js";

const makeStreamItem = (overrides: Record<string, unknown>): TimeEntryStreamItem =>
  Schema.decodeUnknownSync(TimeEntryStreamItem)({
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

  const excludedItems = [
    makeStreamItem({ id: 1, start: undefined }), // planned only
    makeStreamItem({ id: 2, duration: undefined }), // running timer
    makeStreamItem({ id: 3, duration: -1 }), // negative duration
    makeStreamItem({ id: 4, start: "invalid-date" }), // invalid start string
    makeStreamItem({ id: 5, deleted_at: "2026-11-27T10:00:00Z" }),
    makeStreamItem({ id: 6, archived_at: "2026-11-27T10:00:00Z" }),
    makeStreamItem({ id: 7, draft: true }),
    makeStreamItem({ id: 8, pattern_managed: true }),
    makeStreamItem({ id: 9, lock_reason: "time_entry_invoiced" }),
  ];

  const result = mapStreamItemsToTimeEntries([valid, ...excludedItems]);

  expect(result.fetchedCount).toBe(10);
  expect(result.excludedCount).toBe(9);
  expect(result.entries).toStrictEqual([
    {
      id: 10,
      interval: TimeInterval.make({
        start: TimeInstant.make(Date.parse("2026-11-27T09:00:00+09:00")),
        end: TimeInstant.make(Date.parse("2026-11-27T09:00:00+09:00") + 1_800_000),
      }),
      type: "break",
      taskId: Option.some(5),
      projectId: Option.some(6),
      clientId: Option.some(70),
      description: "休憩",
      tagIds: [10, 20, 30],
      billable: true,
      hasScheduleBinding: true,
    },
  ]);
});

it("projectId と clientId の優先順位を仕様通りに解決し未設定値を既定値へ正規化すること", () => {
  const fromTaskProjectClient = makeStreamItem({
    id: 1,
    task: {
      id: 100,
      project_id: 200,
      project: { id: 200, client: { id: 300 } },
      client: { id: 999 },
    },
  });
  const fromTaskDirectClient = makeStreamItem({
    id: 2,
    task: {
      id: 101,
      client: { id: 301 },
    },
    planned_duration: 1800,
  });
  const fromCalendarEvent = makeStreamItem({
    id: 3,
    calendar_event_id: 777,
  });
  const plain = makeStreamItem({ id: 4 });

  const result = mapStreamItemsToTimeEntries([
    fromTaskProjectClient,
    fromTaskDirectClient,
    fromCalendarEvent,
    plain,
  ]);

  expect(result.entries[0]).toMatchObject({
    id: 1,
    projectId: Option.some(200),
    clientId: Option.some(300),
    description: "",
    tagIds: [],
    billable: false,
    hasScheduleBinding: false,
  });
  expect(result.entries[1]).toMatchObject({
    id: 2,
    projectId: Option.none(),
    clientId: Option.some(301),
    hasScheduleBinding: true,
  });
  expect(result.entries[2]?.hasScheduleBinding).toBe(true);
  expect(result.entries[3]).toMatchObject({
    id: 4,
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
