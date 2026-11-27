import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { Option, Schema } from "effect";
import { expect, it } from "vitest";

import { TimeEntry } from "./time-entry.js";

const validInterval = TimeInterval.make({
  start: TimeInstant.make(1_764_234_000_000),
  end: TimeInstant.make(1_764_237_600_000),
});

it("有効な TimeEntry をデコードできること", () => {
  const decoded = Schema.decodeUnknownSync(TimeEntry)({
    id: 1,
    interval: validInterval,
    type: "activity",
    taskId: Option.some(10),
    projectId: Option.some(20),
    clientId: Option.none(),
    description: "実装作業",
    tagIds: [1, 2],
    billable: true,
    hasScheduleBinding: false,
  });

  expect(decoded.id).toBe(1);
  expect(decoded.type).toBe("activity");
  expect(decoded.tagIds).toStrictEqual([1, 2]);
});

it.each([
  { label: "type が不正", payload: { id: 1, interval: validInterval, type: "other" } },
  {
    label: "interval が逆転",
    payload: { id: 1, interval: { start: 2000, end: 1000 }, type: "break" },
  },
])("不正な TimeEntry（$label）はデコードに失敗すること", ({ payload }) => {
  expect(() => Schema.decodeUnknownSync(TimeEntry)(payload)).toThrow();
});
