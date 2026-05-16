import { describe, expectTypeOf, it } from "vitest";

import { positiveInteger, type PositiveInteger } from "./positive-integer.js";

describe("PositiveInteger 型の検証", () => {
  describe("正常系", () => {
    it("正の整数を許容する", () => {
      expectTypeOf<PositiveInteger<1>>().toEqualTypeOf<1>();
      expectTypeOf<PositiveInteger<100>>().toEqualTypeOf<100>();
    });
  });

  describe("異常系", () => {
    it("0 を許容しない", () => {
      expectTypeOf<PositiveInteger<0>>().toBeNever();
    });

    it("負の整数を許容しない", () => {
      expectTypeOf<PositiveInteger<-1>>().toBeNever();
      expectTypeOf<PositiveInteger<-100>>().toBeNever();
    });

    it("小数を許容しない", () => {
      expectTypeOf<PositiveInteger<1.1>>().toBeNever();
      expectTypeOf<PositiveInteger<-1.1>>().toBeNever();
    });
  });

  describe("境界値テスト", () => {
    it("NaN や Infinity は型レベルでは制限されない (現状の仕様)", () => {
      // TS では NaN や Infinity のリテラル型が存在しないため、number として扱われる
      expectTypeOf<PositiveInteger<typeof Number.NaN>>().not.toBeNever();
      expectTypeOf<PositiveInteger<typeof Infinity>>().not.toBeNever();
    });
  });
});

describe("positiveInteger 関数の検証", () => {
  it("正の整数のみを受け入れる", () => {
    expectTypeOf(positiveInteger(1)).toEqualTypeOf<1>();
    // @ts-expect-error 0 は正の整数ではない
    expectTypeOf(positiveInteger(0)).toBeNever();
    // @ts-expect-error -1 は正の整数ではない
    expectTypeOf(positiveInteger(-1)).toBeNever();
    // @ts-expect-error 1.1 は正の整数ではない
    expectTypeOf(positiveInteger(1.1)).toBeNever();
  });
});
