import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { Option, Schema } from "effect";
import { expect, it } from "vitest";

import { ClientId } from "./client-id.js";
import { ProjectId } from "./project-id.js";
import { TagId } from "./tag-id.js";
import { TaskId } from "./task-id.js";
import { TimeEntryId } from "./time-entry-id.js";
import { TimeEntry } from "./time-entry.js";

const validInterval = TimeInterval.make({
  start: TimeInstant.make(1_764_234_000_000),
  end: TimeInstant.make(1_764_237_600_000),
});

const validPayload = {
  id: TimeEntryId.make(1),
  interval: validInterval,
  type: "activity" as const,
  taskId: Option.some(TaskId.make(10)),
  projectId: Option.some(ProjectId.make(20)),
  clientId: Option.some(ClientId.make(30)),
  description: "実装作業",
  tagIds: [TagId.make(1), TagId.make(2)],
  billable: true,
  hasScheduleBinding: false,
};

it("有効な TimeEntry をデコードできること", () => {
  const decoded = Schema.decodeUnknownSync(TimeEntry)(validPayload);

  expect(decoded.id).toBe(TimeEntryId.make(1));
  expect(decoded.type).toBe("activity");
  expect(decoded.tagIds).toStrictEqual([TagId.make(1), TagId.make(2)]);
});

it.each([
  { label: "type が不正", overrides: { type: "other" } },
  { label: "interval が逆転", overrides: { interval: { start: 2000, end: 1000 } } },
  { label: "id が 0", overrides: { id: 0 } },
  { label: "taskId が負数", overrides: { taskId: Option.some(-1) } },
  { label: "tagIds に 0 を含む", overrides: { tagIds: [0] } },
])("不正な TimeEntry（$label）はデコードに失敗すること", ({ overrides }) => {
  expect(() => Schema.decodeUnknownSync(TimeEntry)({ ...validPayload, ...overrides })).toThrow();
});
