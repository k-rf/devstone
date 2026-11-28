import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { TimeInstant } from "./time-instant.js";

describe("正常系", () => {
  it.each([0, 1, 1_700_000_000_000, -1000, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER])(
    "有限整数 (%i) を TimeInstant としてデコードできること",
    (value) => {
      const result = Schema.decodeUnknownSync(TimeInstant)(value);
      expect(result).toBe(value);
    },
  );
});

const jsonNull: unknown = JSON.parse("null");

describe("異常系", () => {
  it.each([
    ["NaN", Number.NaN],
    ["正の無限大", Infinity],
    ["負の無限大", -Infinity],
    ["小数", 123.45],
    ["文字列", "1000"],
    ["null", jsonNull],
    ["undefined", undefined],
    ["安全な整数範囲外", Number.MAX_SAFE_INTEGER + 1],
  ])("%s のときデコードに失敗すること", async (_label, value) => {
    const error = await Effect.runPromise(Effect.flip(Schema.decodeUnknown(TimeInstant)(value)));
    expect(error._tag).toBe("ParseError");
  });
});
