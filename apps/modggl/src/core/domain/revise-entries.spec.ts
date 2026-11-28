import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { Option } from "effect";
import { describe, expect, it } from "vitest";

import { reviseEntries } from "./revise-entries.js";
import { sortTimeEntries } from "./sort-time-entries.js";
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

  it("ゼロ長区間の直後に通常エントリーが続く場合は隙間なく接続扱いになること", () => {
    const result = reviseEntries([makeEntry(1, 0, 0), makeEntry(2, 0, 600)]);

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
      modifications: [
        { id: TimeEntryId.make(1), previousInterval: interval(0, 500), interval: interval(0, 600) },
      ],
      deletions: [],
    });
  });

  it("重複する非同一ペア（LessOverlap）では first.end を second.start へ切り詰めること", () => {
    const result = reviseEntries([makeEntry(1, 0, 700), makeEntry(2, 600, 1200)]);

    expect(result).toStrictEqual({
      _tag: "Planned",
      modifications: [
        { id: TimeEntryId.make(1), previousInterval: interval(0, 700), interval: interval(0, 600) },
      ],
      deletions: [],
    });
  });

  it("包含する非同一ペア（LessOuter）では後方開始の second を優先し first.end を second.start へ切り詰めること", () => {
    const result = reviseEntries([makeEntry(1, 0, 1500), makeEntry(2, 600, 1200)]);

    expect(result).toStrictEqual({
      _tag: "Planned",
      modifications: [
        {
          id: TimeEntryId.make(1),
          previousInterval: interval(0, 1500),
          interval: interval(0, 600),
        },
      ],
      deletions: [],
    });
  });

  it("同一エントリーマージ後に次エントリーとの重複で元の区間長へ戻った場合は不要な更新を省くこと", () => {
    const e1 = makeEntry(1, 0, 600, { description: "A" });
    const e2 = makeEntry(2, 500, 900, { description: "A" });
    const e3 = makeEntry(3, 600, 1200, { description: "B" });

    const result = reviseEntries([e1, e2, e3]);

    expect(result).toStrictEqual({
      _tag: "Planned",
      modifications: [],
      deletions: [TimeEntryId.make(2)],
    });
  });

  it("3件以上の非同一エントリーで隙間補完・重複切り詰め・連続接続を順に処理すること", () => {
    const e1 = makeEntry(1, 0, 300, { description: "A" });
    const e2 = makeEntry(2, 400, 800, { description: "B" });
    const e3 = makeEntry(3, 700, 1000, { description: "C" });
    const e4 = makeEntry(4, 1000, 1200, { description: "D" });

    const result = reviseEntries([e1, e2, e3, e4]);

    expect(result).toStrictEqual({
      _tag: "Planned",
      modifications: [
        { id: TimeEntryId.make(1), previousInterval: interval(0, 300), interval: interval(0, 400) },
        {
          id: TimeEntryId.make(2),
          previousInterval: interval(400, 800),
          interval: interval(400, 700),
        },
      ],
      deletions: [],
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
      modifications: [
        {
          id: TimeEntryId.make(3),
          previousInterval: interval(600, 800),
          interval: interval(0, 1000),
        },
      ],
      deletions: [TimeEntryId.make(2), TimeEntryId.make(1)],
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

  it("同一開始時刻の異内容競合があるときは ID 順に関わらずマージ前に NotDetermine で全停止すること", () => {
    const a1 = makeEntry(1, 0, 600, { description: "A" });
    const aSmall = makeEntry(2, 600, 900, { description: "A" });
    const aLarge = makeEntry(30, 600, 900, { description: "A" });
    const bSameLength = makeEntry(3, 600, 900, { description: "B" });
    const bLonger = makeEntry(3, 600, 1200, { description: "B" });

    expect(reviseEntries(sortTimeEntries([a1, aSmall, bSameLength]))).toStrictEqual({
      _tag: "Aborted",
      reason: "NotDetermine",
      first: aSmall,
      second: bSameLength,
    });

    expect(reviseEntries(sortTimeEntries([a1, aLarge, bSameLength]))).toStrictEqual({
      _tag: "Aborted",
      reason: "NotDetermine",
      first: bSameLength,
      second: aLarge,
    });

    expect(reviseEntries(sortTimeEntries([a1, aSmall, bLonger]))).toStrictEqual({
      _tag: "Aborted",
      reason: "NotDetermine",
      first: aSmall,
      second: bLonger,
    });
  });

  it("前段ペアの補正蓄積後に後続で判定不能重複を検出した場合も All-or-Nothing で Aborted を返すこと", () => {
    const e1 = makeEntry(1, 0, 300, { description: "A" });
    const e2 = makeEntry(2, 400, 700, { description: "B" });
    const e3 = makeEntry(3, 800, 1100, { description: "C" });
    const e4 = makeEntry(4, 800, 1100, { description: "D" });

    const result = reviseEntries([e1, e2, e3, e4]);

    expect(result).toStrictEqual({
      _tag: "Aborted",
      reason: "NotDetermine",
      first: e3,
      second: e4,
    });
  });

  it("前段ペアの補正蓄積後に後続で順序異常を検出した場合も All-or-Nothing で Aborted を返すこと", () => {
    const e1 = makeEntry(1, 0, 300, { description: "A" });
    const e2 = makeEntry(2, 400, 900, { description: "B" });
    const e3 = makeEntry(3, 200, 500, { description: "C" });

    const result = reviseEntries([e1, e2, e3]);

    expect(result).toStrictEqual({
      _tag: "Aborted",
      reason: "InvalidOrder",
      first: e2,
      second: e3,
    });
  });

  it("両方 hasScheduleBinding=true の同一エントリーが Equivalent のときマージせず NotDetermine で停止すること", () => {
    const first = makeEntry(1, 0, 600, { description: "Same", hasScheduleBinding: true });
    const second = makeEntry(2, 0, 600, { description: "Same", hasScheduleBinding: true });
    const third = makeEntry(3, 1200, 1800, { description: "Other" });

    const result = reviseEntries([first, second, third]);

    expect(result).toStrictEqual({
      _tag: "Aborted",
      reason: "NotDetermine",
      first: first,
      second: second,
    });
  });
});
