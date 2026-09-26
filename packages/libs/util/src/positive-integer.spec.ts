import { describe, expect, it } from "vitest";

import { positiveInteger } from "./positive-integer.js";

describe("正常系", () => {
  it.each([1, 100] as const)("正の整数 (%i) のとき、そのまま値を返す", (value) => {
    expect(positiveInteger(value)).toBe(value);
  });
});

describe("異常系", () => {
  it.each([0, -1, 1.1] as const)("%f のとき、コンパイルエラーになる", (value) => {
    // @ts-expect-error 引数は正の整数でなければならない
    positiveInteger(value);
  });
});

describe("境界値テスト", () => {
  it.each([Number.NaN, Infinity])("%s のとき、そのまま値を返す (型定義の制限内)", (value) => {
    expect(positiveInteger(value)).toBe(value);
  });
});
