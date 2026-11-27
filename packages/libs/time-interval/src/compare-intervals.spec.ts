import { Schema } from "effect";
import { describe, expect, it } from "vitest";

import { compareIntervals } from "./compare-intervals.js";
import { type IntervalRelation } from "./interval-relation.js";
import { TimeInterval } from "./time-interval.js";

const interval = (start: number, end: number): TimeInterval =>
  Schema.decodeUnknownSync(TimeInterval)({ start: start, end: end });

describe("基本の 9 パターン", () => {
  it.each<{
    readonly label: string;
    readonly first: TimeInterval;
    readonly second: TimeInterval;
    readonly expected: IntervalRelation;
  }>([
    {
      label: "開始・終了ともに等しいとき Equivalent を返す",
      first: interval(100, 200),
      second: interval(100, 200),
      expected: "Equivalent",
    },
    {
      label: "first が second より完全に前のとき Less を返す",
      first: interval(100, 200),
      second: interval(300, 400),
      expected: "Less",
    },
    {
      label: "first が second より完全に後のとき Greater を返す",
      first: interval(300, 400),
      second: interval(100, 200),
      expected: "Greater",
    },
    {
      label: "first が先に開始し途中で重なり先に終了するとき LessOverlap を返す",
      first: interval(100, 300),
      second: interval(200, 400),
      expected: "LessOverlap",
    },
    {
      label: "first が後に開始し途中で重なり後に終了するとき GreaterOverlap を返す",
      first: interval(200, 400),
      second: interval(100, 300),
      expected: "GreaterOverlap",
    },
    {
      label: "開始時刻が同じで first が早く終了するとき LessInner を返す",
      first: interval(100, 200),
      second: interval(100, 300),
      expected: "LessInner",
    },
    {
      label: "first が second の内部に完全に含まれるとき GreaterInner を返す",
      first: interval(150, 250),
      second: interval(100, 300),
      expected: "GreaterInner",
    },
    {
      label: "first が second を完全に包含するとき LessOuter を返す",
      first: interval(100, 300),
      second: interval(150, 250),
      expected: "LessOuter",
    },
    {
      label: "開始時刻が同じで first が遅く終了するとき GreaterOuter を返す",
      first: interval(100, 300),
      second: interval(100, 200),
      expected: "GreaterOuter",
    },
  ])("$label", ({ first, second, expected }) => {
    expect(compareIntervals(first, second)).toBe(expected);
  });
});

describe("境界一致とゼロ長区間", () => {
  it.each<{
    readonly label: string;
    readonly first: TimeInterval;
    readonly second: TimeInterval;
    readonly expected: IntervalRelation;
  }>([
    {
      label: "first.end === second.start で隣接するとき Less を返す",
      first: interval(100, 200),
      second: interval(200, 300),
      expected: "Less",
    },
    {
      label: "second.end === first.start で隣接するとき Greater を返す",
      first: interval(200, 300),
      second: interval(100, 200),
      expected: "Greater",
    },
    {
      label: "first.start < second.start かつ first.end === second.end のとき LessOuter を返す",
      first: interval(100, 300),
      second: interval(200, 300),
      expected: "LessOuter",
    },
    {
      label: "first.start > second.start かつ first.end === second.end のとき GreaterInner を返す",
      first: interval(200, 300),
      second: interval(100, 300),
      expected: "GreaterInner",
    },
    {
      label: "同一時刻のゼロ長区間同士のとき Equivalent を返す",
      first: interval(100, 100),
      second: interval(100, 100),
      expected: "Equivalent",
    },
    {
      label: "異なる時刻のゼロ長区間が前方のとき Less を返す",
      first: interval(100, 100),
      second: interval(200, 200),
      expected: "Less",
    },
    {
      label: "異なる時刻のゼロ長区間が後方のとき Greater を返す",
      first: interval(200, 200),
      second: interval(100, 100),
      expected: "Greater",
    },
    {
      label: "先頭境界と一致するゼロ長区間が前のとき Less を返す",
      first: interval(100, 100),
      second: interval(100, 200),
      expected: "Less",
    },
    {
      label: "先頭境界と一致するゼロ長区間が後のとき Greater を返す",
      first: interval(100, 200),
      second: interval(100, 100),
      expected: "Greater",
    },
    {
      label: "末尾境界と一致するゼロ長区間が後のとき Less を返す",
      first: interval(100, 200),
      second: interval(200, 200),
      expected: "Less",
    },
    {
      label: "末尾境界と一致するゼロ長区間が前のとき Greater を返す",
      first: interval(200, 200),
      second: interval(100, 200),
      expected: "Greater",
    },
    {
      label: "区間の内側にゼロ長区間が含まれるとき LessOuter を返す",
      first: interval(100, 300),
      second: interval(200, 200),
      expected: "LessOuter",
    },
    {
      label: "ゼロ長区間が別区間の内側に含まれるとき GreaterInner を返す",
      first: interval(200, 200),
      second: interval(100, 300),
      expected: "GreaterInner",
    },
  ])("$label", ({ first, second, expected }) => {
    expect(compareIntervals(first, second)).toBe(expected);
  });
});
