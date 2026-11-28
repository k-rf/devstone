import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { TimeInterval } from "./time-interval.js";

describe("正常系", () => {
  it("start < end の有効な区間をデコードできること", () => {
    const result = Schema.decodeUnknownSync(TimeInterval)({ start: 1000, end: 5000 });
    expect(result).toEqual({ start: 1000, end: 5000 });
  });

  it("start === end のゼロ長区間をデコードできること", () => {
    const result = Schema.decodeUnknownSync(TimeInterval)({ start: 1000, end: 1000 });
    expect(result).toEqual({ start: 1000, end: 1000 });
  });
});

const jsonNull: unknown = JSON.parse("null");

describe("異常系", () => {
  it("start > end の区間を拒否すること", () => {
    expect(() => Schema.decodeUnknownSync(TimeInterval)({ start: 5000, end: 1000 })).toThrow(
      "開始時刻は終了時刻以下である必要があります",
    );
  });

  it.each([
    ["start が NaN", { start: Number.NaN, end: 1000 }],
    ["end が Infinity", { start: 1000, end: Infinity }],
    ["start が小数", { start: 10.5, end: 1000 }],
    ["end が null", { start: 1000, end: jsonNull }],
    ["start が undefined", { start: undefined, end: 1000 }],
  ])("%s のときスキーマ検証に失敗すること", async (_label, input) => {
    const error = await Effect.runPromise(Effect.flip(Schema.decodeUnknown(TimeInterval)(input)));
    expect(error._tag).toBe("ParseError");
  });
});
