import { Schema } from "effect";
import { expect, it } from "vitest";

import { getIntervalDurationSeconds } from "./get-interval-duration-seconds.js";
import { TimeInterval } from "./time-interval.js";

const interval = (start: number, end: number): TimeInterval =>
  Schema.decodeUnknownSync(TimeInterval)({ start: start, end: end });

it.each([
  {
    label: "ゼロ長区間のとき 0 を返すこと",
    target: interval(1000, 1000),
    expected: 0,
  },
  {
    label: "1000 ミリ秒の倍数のとき正確な秒数を返すこと",
    target: interval(1000, 61_000),
    expected: 60,
  },
  {
    label: "1 秒未満の端数があるとき小数点以下を切り捨てた整数秒を返すこと",
    target: interval(1000, 2999),
    expected: 1,
  },
  {
    label: "1 秒未満の区間のとき 0 を返すこと",
    target: interval(1000, 1999),
    expected: 0,
  },
])("$label", ({ target, expected }) => {
  expect(getIntervalDurationSeconds(target)).toBe(expected);
});
