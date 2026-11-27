import { Schema } from "effect";
import { expect, it } from "vitest";

import { mergeIntervalBounds } from "./merge-interval-bounds.js";
import { TimeInterval } from "./time-interval.js";

const interval = (start: number, end: number): TimeInterval =>
  Schema.decodeUnknownSync(TimeInterval)({ start: start, end: end });

it.each([
  {
    label: "重なりのない 2 区間の外接区間を返すこと",
    first: interval(100, 200),
    second: interval(300, 400),
    expected: { start: 100, end: 400 },
  },
  {
    label: "順序が逆の 2 区間でも最小開始時刻と最大終了時刻を返すこと",
    first: interval(300, 400),
    second: interval(100, 200),
    expected: { start: 100, end: 400 },
  },
  {
    label: "一方の区間が他方を包含するとき外側の区間を返すこと",
    first: interval(100, 500),
    second: interval(200, 300),
    expected: { start: 100, end: 500 },
  },
  {
    label: "内包される区間が先でも外側の区間を返すこと",
    first: interval(200, 300),
    second: interval(100, 500),
    expected: { start: 100, end: 500 },
  },
  {
    label: "同一のゼロ長区間同士のとき同じゼロ長区間を返すこと",
    first: interval(100, 100),
    second: interval(100, 100),
    expected: { start: 100, end: 100 },
  },
])("$label", ({ first, second, expected }) => {
  expect(mergeIntervalBounds(first, second)).toEqual(expected);
});
