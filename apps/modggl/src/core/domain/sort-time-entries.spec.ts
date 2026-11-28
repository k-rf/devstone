import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { Option } from "effect";
import { expect, it } from "vitest";

import { sortTimeEntries } from "./sort-time-entries.js";
import { TimeEntryId } from "./time-entry-id.js";
import { type TimeEntry } from "./time-entry.js";

const makeEntry = (id: number, startSec: number, endSec: number): TimeEntry => ({
  id: TimeEntryId.make(id),
  interval: TimeInterval.make({
    start: TimeInstant.make(startSec * 1000),
    end: TimeInstant.make(endSec * 1000),
  }),
  type: "activity",
  taskId: Option.none(),
  projectId: Option.none(),
  clientId: Option.none(),
  description: `entry-${String(id)}`,
  tagIds: [],
  billable: false,
  hasScheduleBinding: false,
});

it("(start ASC, end ASC, id ASC) の優先順でソートし元の配列を変更しないこと", () => {
  const e1 = makeEntry(20, 100, 300);
  const e2 = makeEntry(10, 100, 300);
  const e3 = makeEntry(5, 100, 200);
  const e4 = makeEntry(1, 50, 400);
  const input = [e1, e2, e3, e4];

  const sorted = sortTimeEntries(input);

  expect(sorted.map((entry) => entry.id)).toStrictEqual([1, 5, 10, 20]);
  expect(input.map((entry) => entry.id)).toStrictEqual([20, 10, 5, 1]);
});
