import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { Option } from "effect";
import { expect, it } from "vitest";

import { ClientId } from "./client-id.js";
import { mergeSameEntries } from "./merge-same-entries.js";
import { ProjectId } from "./project-id.js";
import { TagId } from "./tag-id.js";
import { TaskId } from "./task-id.js";
import { TimeEntryId } from "./time-entry-id.js";
import { type TimeEntry } from "./time-entry.js";

const interval = (startSec: number, endSec: number): TimeInterval =>
  TimeInterval.make({
    start: TimeInstant.make(startSec * 1000),
    end: TimeInstant.make(endSec * 1000),
  });

const makeEntry = (
  id: number,
  startSec: number,
  endSec: number,
  overrides: Partial<TimeEntry> = {},
): TimeEntry => ({
  id: TimeEntryId.make(id),
  interval: interval(startSec, endSec),
  type: "activity",
  taskId: Option.some(TaskId.make(10)),
  projectId: Option.some(ProjectId.make(20)),
  clientId: Option.some(ClientId.make(30)),
  description: "作業",
  tagIds: [TagId.make(1)],
  billable: false,
  hasScheduleBinding: false,
  ...overrides,
});

it("空配列に対して空の結果を返すこと", () => {
  expect(mergeSameEntries([])).toStrictEqual({
    entries: [],
    modifications: [],
    deletions: [],
  });
});

it("単一エントリーの場合は変更・削除なしでそのまま返すこと", () => {
  const entry = makeEntry(1, 0, 600);

  expect(mergeSameEntries([entry])).toStrictEqual({
    entries: [entry],
    modifications: [],
    deletions: [],
  });
});

it("異なるエントリーが隣接している場合はマージしないこと", () => {
  const first = makeEntry(1, 0, 600, { description: "A" });
  const second = makeEntry(2, 600, 1200, { description: "B" });

  expect(mergeSameEntries([first, second])).toStrictEqual({
    entries: [first, second],
    modifications: [],
    deletions: [],
  });
});

it("両方 hasScheduleBinding=false の同一ペアは first を残して second を削除すること", () => {
  const first = makeEntry(1, 0, 600, { hasScheduleBinding: false });
  const second = makeEntry(2, 600, 1200, { hasScheduleBinding: false });

  const result = mergeSameEntries([first, second]);

  expect(result.entries).toStrictEqual([makeEntry(1, 0, 1200, { hasScheduleBinding: false })]);
  expect(result.modifications).toStrictEqual([
    { id: TimeEntryId.make(1), previousInterval: interval(0, 600), interval: interval(0, 1200) },
  ]);
  expect(result.deletions).toStrictEqual([TimeEntryId.make(2)]);
});

it("first=true, second=false の同一ペアは first を残して second を削除すること", () => {
  const first = makeEntry(1, 0, 600, { hasScheduleBinding: true });
  const second = makeEntry(2, 600, 1200, { hasScheduleBinding: false });

  const result = mergeSameEntries([first, second]);

  expect(result.entries).toStrictEqual([makeEntry(1, 0, 1200, { hasScheduleBinding: true })]);
  expect(result.modifications).toStrictEqual([
    { id: TimeEntryId.make(1), previousInterval: interval(0, 600), interval: interval(0, 1200) },
  ]);
  expect(result.deletions).toStrictEqual([TimeEntryId.make(2)]);
});

it("first=false, second=true の同一ペアは second を残して first を削除すること", () => {
  const first = makeEntry(1, 0, 600, { hasScheduleBinding: false });
  const second = makeEntry(2, 600, 1200, { hasScheduleBinding: true });

  const result = mergeSameEntries([first, second]);

  expect(result.entries).toStrictEqual([makeEntry(2, 0, 1200, { hasScheduleBinding: true })]);
  expect(result.modifications).toStrictEqual([
    { id: TimeEntryId.make(2), previousInterval: interval(600, 1200), interval: interval(0, 1200) },
  ]);
  expect(result.deletions).toStrictEqual([TimeEntryId.make(1)]);
});

it("両方 hasScheduleBinding=true の同一ペアはマージせず両方残すこと", () => {
  const first = makeEntry(1, 0, 600, { hasScheduleBinding: true });
  const second = makeEntry(2, 600, 1200, { hasScheduleBinding: true });

  const result = mergeSameEntries([first, second]);

  expect(result).toStrictEqual({
    entries: [first, second],
    modifications: [],
    deletions: [],
  });
});

it("完全同一区間の同一ペアでは second を削除し modifications は空にすること", () => {
  const first = makeEntry(1, 0, 600);
  const second = makeEntry(2, 0, 600);

  const result = mergeSameEntries([first, second]);

  expect(result).toStrictEqual({
    entries: [first],
    modifications: [],
    deletions: [TimeEntryId.make(2)],
  });
});

it("3件連鎖マージで3件目に hasScheduleBinding=true があるとき、先に modifications 入りした1件目が削除され PATCH/DELETE 衝突しないこと", () => {
  const first = makeEntry(1, 0, 600, { hasScheduleBinding: false });
  const second = makeEntry(2, 600, 1200, { hasScheduleBinding: false });
  const third = makeEntry(3, 1200, 1800, { hasScheduleBinding: true });

  const result = mergeSameEntries([first, second, third]);

  expect(result.entries).toStrictEqual([makeEntry(3, 0, 1800, { hasScheduleBinding: true })]);
  expect(result.modifications).toStrictEqual([
    {
      id: TimeEntryId.make(3),
      previousInterval: interval(1200, 1800),
      interval: interval(0, 1800),
    },
  ]);
  expect(result.deletions).toStrictEqual([TimeEntryId.make(2), TimeEntryId.make(1)]);
  expect(
    result.modifications.some((modification) => result.deletions.includes(modification.id)),
  ).toBe(false);
});

it("3件連鎖マージで2件目に hasScheduleBinding=true があるとき2件目を保持し元の区間を維持すること", () => {
  const first = makeEntry(1, 0, 600, { hasScheduleBinding: false });
  const second = makeEntry(2, 600, 1200, { hasScheduleBinding: true });
  const third = makeEntry(3, 1200, 1800, { hasScheduleBinding: false });

  const result = mergeSameEntries([first, second, third]);

  expect(result.entries).toStrictEqual([makeEntry(2, 0, 1800, { hasScheduleBinding: true })]);
  expect(result.modifications).toStrictEqual([
    { id: TimeEntryId.make(2), previousInterval: interval(600, 1200), interval: interval(0, 1800) },
  ]);
  expect(result.deletions).toStrictEqual([TimeEntryId.make(1), TimeEntryId.make(3)]);
});

it("1件目と3件目が hasScheduleBinding=true で2件目が false のとき、1+2 のみマージし3件目は独立して残すこと", () => {
  const first = makeEntry(1, 0, 600, { hasScheduleBinding: true });
  const second = makeEntry(2, 600, 1200, { hasScheduleBinding: false });
  const third = makeEntry(3, 1200, 1800, { hasScheduleBinding: true });

  const result = mergeSameEntries([first, second, third]);

  expect(result.entries).toStrictEqual([
    makeEntry(1, 0, 1200, { hasScheduleBinding: true }),
    third,
  ]);
  expect(result.modifications).toStrictEqual([
    { id: TimeEntryId.make(1), previousInterval: interval(0, 600), interval: interval(0, 1200) },
  ]);
  expect(result.deletions).toStrictEqual([TimeEntryId.make(2)]);
});
