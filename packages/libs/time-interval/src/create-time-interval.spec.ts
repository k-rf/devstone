import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { createTimeInterval } from "./create-time-interval.js";
import { TimeInstant } from "./time-instant.js";

const instant = (value: number): TimeInstant => Schema.decodeUnknownSync(TimeInstant)(value);

describe("正常系", () => {
  it("start < end のとき検証済みの TimeInterval を生成できること", async () => {
    const result = await Effect.runPromise(createTimeInterval(instant(1000), instant(5000)));
    expect(result).toEqual({ start: 1000, end: 5000 });
  });

  it("start === end のゼロ長 TimeInterval を生成できること", async () => {
    const result = await Effect.runPromise(createTimeInterval(instant(1000), instant(1000)));
    expect(result).toEqual({ start: 1000, end: 1000 });
  });
});

describe("異常系", () => {
  it("start > end のとき InvalidTimeIntervalError で失敗すること", async () => {
    const start = instant(5000);
    const end = instant(1000);

    const error = await Effect.runPromise(Effect.flip(createTimeInterval(start, end)));

    expect(error._tag).toBe("InvalidTimeIntervalError");
    expect(error.start).toBe(5000);
    expect(error.end).toBe(1000);
    expect(error.message).toContain("5000");
    expect(error.message).toContain("1000");
  });
});
