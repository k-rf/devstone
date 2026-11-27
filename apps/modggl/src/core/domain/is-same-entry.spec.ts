import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { Option } from "effect";
import { expect, it } from "vitest";

import { isSameEntry } from "./is-same-entry.js";
import { type TimeEntry } from "./time-entry.js";

const makeEntry = (overrides: Partial<TimeEntry> = {}): TimeEntry => ({
  id: 1,
  interval: TimeInterval.make({
    start: TimeInstant.make(1_764_234_000_000),
    end: TimeInstant.make(1_764_237_600_000),
  }),
  type: "activity",
  taskId: Option.some(10),
  projectId: Option.some(20),
  clientId: Option.some(30),
  description: "設計レビュー",
  tagIds: [1, 2],
  billable: true,
  hasScheduleBinding: false,
  ...overrides,
});

it("id・時間区間・スケジュール連携有無が異なっても他の属性がすべて一致すれば true を返すこと", () => {
  const first = makeEntry({ id: 1, hasScheduleBinding: false });
  const second = makeEntry({
    id: 99,
    interval: TimeInterval.make({
      start: TimeInstant.make(1_764_237_600_000),
      end: TimeInstant.make(1_764_241_200_000),
    }),
    hasScheduleBinding: true,
  });

  expect(isSameEntry(first, second)).toBe(true);
});

it("taskId・projectId・clientId が両方とも Option.none かつ tagIds が空のときも一致すれば true を返すこと", () => {
  const first = makeEntry({
    taskId: Option.none(),
    projectId: Option.none(),
    clientId: Option.none(),
    description: "",
    tagIds: [],
    billable: false,
  });
  const second = makeEntry({
    id: 2,
    taskId: Option.none(),
    projectId: Option.none(),
    clientId: Option.none(),
    description: "",
    tagIds: [],
    billable: false,
  });

  expect(isSameEntry(first, second)).toBe(true);
});

it.each([
  { label: "type が異なる", overrides: { type: "break" as const } },
  { label: "taskId が異なる", overrides: { taskId: Option.some(11) } },
  { label: "taskId が片方 None", overrides: { taskId: Option.none() } },
  { label: "projectId が異なる", overrides: { projectId: Option.some(21) } },
  { label: "clientId が異なる", overrides: { clientId: Option.some(31) } },
  { label: "description が異なる", overrides: { description: "別タスク" } },
  { label: "tagIds の長さが異なる", overrides: { tagIds: [1] } },
  { label: "tagIds の要素が異なる", overrides: { tagIds: [1, 3] } },
  { label: "billable が異なる", overrides: { billable: false } },
])("同一判定で不一致（$label）の場合に false を返すこと", ({ overrides }) => {
  const first = makeEntry();
  const second = makeEntry(overrides);

  expect(isSameEntry(first, second)).toBe(false);
});
