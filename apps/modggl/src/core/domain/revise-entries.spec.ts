import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { Option } from "effect";
import { describe, expect, it } from "vitest";

import { reviseEntries } from "./revise-entries.js";
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
  id: id,
  interval: interval(startSec, endSec),
  type: "activity",
  taskId: Option.none(),
  projectId: Option.none(),
  clientId: Option.none(),
  description: `entry-${String(id)}`,
  tagIds: [],
  billable: false,
  hasScheduleBinding: false,
  ...overrides,
});

describe("正常系（計画生成）", () => {
  it("空配列および単一エントリーでは変更・削除なしの計画を返すこと", () => {
    expect(reviseEntries([])).toStrictEqual({
      _tag: "Planned",
      modifications: [],
      deletions: [],
    });
    expect(reviseEntries([makeEntry(1, 0, 600)])).toStrictEqual({
      _tag: "Planned",
      modifications: [],
      deletions: [],
    });
  });

  it("隙間なく連続する非同一ペア（Less かつ first.end === second.start）では変更なしとなること", () => {
    const result = reviseEntries([makeEntry(1, 0, 600), makeEntry(2, 600, 1200)]);

    expect(result).toStrictEqual({
      _tag: "Planned",
      modifications: [],
      deletions: [],
    });
  });

  it("隙間のある非同一ペア（Less かつ first.end < second.start）では first.end を second.start まで延長すること", () => {
    const result = reviseEntries([makeEntry(1, 0, 500), makeEntry(2, 600, 1200)]);

    expect(result).toStrictEqual({
      _tag: "Planned",
      modifications: [{ id: 1, previousInterval: interval(0, 500), interval: interval(0, 600) }],
      deletions: [],
    });
  });

  it("重複する非同一ペア（LessOverlap）では first.end を second.start へ切り詰めること", () => {
    const result = reviseEntries([makeEntry(1, 0, 700), makeEntry(2, 600, 1200)]);

    expect(result).toStrictEqual({
      _tag: "Planned",
      modifications: [{ id: 1, previousInterval: interval(0, 700), interval: interval(0, 600) }],
      deletions: [],
    });
  });

  it("包含する非同一ペア（LessOuter）では後方開始の second を優先し first.end を second.start へ切り詰めること", () => {
    const result = reviseEntries([makeEntry(1, 0, 1500), makeEntry(2, 600, 1200)]);

    expect(result).toStrictEqual({
      _tag: "Planned",
      modifications: [{ id: 1, previousInterval: interval(0, 1500), interval: interval(0, 600) }],
      deletions: [],
    });
  });

  it("同一エントリーマージ後に次エントリーとの重複で元の区間長へ戻った場合は不要な更新を省くこと", () => {
    const e1 = makeEntry(1, 0, 600, { description: "A" });
    const e2 = makeEntry(2, 600, 900, { description: "A" });
    const e3 = makeEntry(3, 600, 1200, { description: "B" });

    const result = reviseEntries([e1, e2, e3]);

    expect(result).toStrictEqual({
      _tag: "Planned",
      modifications: [],
      deletions: [2],
    });
  });

  it("連鎖マージと隙間補完を組み合わせても PATCH と DELETE に同一 ID が混在しないこと", () => {
    const e1 = makeEntry(1, 0, 300, { description: "A", hasScheduleBinding: false });
    const e2 = makeEntry(2, 300, 600, { description: "A", hasScheduleBinding: false });
    const e3 = makeEntry(3, 600, 800, { description: "A", hasScheduleBinding: true });
    const e4 = makeEntry(4, 1000, 1500, { description: "B" });

    const result = reviseEntries([e1, e2, e3, e4]);

    expect(result).toStrictEqual({
      _tag: "Planned",
      modifications: [{ id: 3, previousInterval: interval(600, 800), interval: interval(0, 1000) }],
      deletions: [2, 1],
    });
  });
});

describe("異常系（全停止 All-or-Nothing）", () => {
  it.each([
    {
      label: "Equivalent",
      first: makeEntry(1, 0, 600),
      second: makeEntry(2, 0, 600),
      expectedReason: "NotDetermine" as const,
    },
    {
      label: "GreaterOuter",
      first: makeEntry(1, 0, 900),
      second: makeEntry(2, 0, 600),
      expectedReason: "NotDetermine" as const,
    },
    {
      label: "LessInner",
      first: makeEntry(1, 0, 600),
      second: makeEntry(2, 0, 900),
      expectedReason: "NotDetermine" as const,
    },
    {
      label: "Greater",
      first: makeEntry(1, 700, 1000),
      second: makeEntry(2, 0, 600),
      expectedReason: "InvalidOrder" as const,
    },
    {
      label: "GreaterOverlap",
      first: makeEntry(1, 300, 1000),
      second: makeEntry(2, 0, 600),
      expectedReason: "InvalidOrder" as const,
    },
    {
      label: "GreaterInner",
      first: makeEntry(1, 300, 600),
      second: makeEntry(2, 0, 600),
      expectedReason: "InvalidOrder" as const,
    },
  ])(
    "$label 関係のペアを検出したとき $expectedReason で即座に停止すること",
    ({ first, second, expectedReason }) => {
      const third = makeEntry(3, 1200, 1800);
      const result = reviseEntries([first, second, third]);

      expect(result).toStrictEqual({
        _tag: "Aborted",
        reason: expectedReason,
        first: first,
        second: second,
      });
    },
  );

  it("両方 hasScheduleBinding=true の同一エントリーが Equivalent のときマージせず NotDetermine で停止すること", () => {
    const first = makeEntry(1, 0, 600, { description: "Same", hasScheduleBinding: true });
    const second = makeEntry(2, 0, 600, { description: "Same", hasScheduleBinding: true });

    const result = reviseEntries([first, second]);

    expect(result).toStrictEqual({
      _tag: "Aborted",
      reason: "NotDetermine",
      first: first,
      second: second,
    });
  });
});
