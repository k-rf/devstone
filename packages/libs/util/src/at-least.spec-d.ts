import { describe, expectTypeOf, it } from "vitest";

import { atLeast, type AtLeast } from "./at-least.js";

describe("正常系", () => {
  it("AtLeast 型は少なくとも N 個の要素を持つ配列を正しく表現できるべき", () => {
    type AtLeast2 = AtLeast<number, 2>;

    expectTypeOf<readonly [number, number, ...(readonly number[])]>().toExtend<AtLeast2>();
    expectTypeOf<readonly [number, number]>().toExtend<AtLeast2>();
    expectTypeOf<readonly [number, number, number]>().toExtend<AtLeast2>();
  });

  it("要素が 1 つの場合の AtLeast 型", () => {
    type AtLeast1 = AtLeast<string, 1>;

    expectTypeOf<readonly [string, ...(readonly string[])]>().toExtend<AtLeast1>();
    expectTypeOf<readonly [string]>().toExtend<AtLeast1>();
    expectTypeOf<readonly [string, string]>().toExtend<AtLeast1>();
  });
});

describe("異常系", () => {
  it("長さが N 未満の場合は一致しないべき", () => {
    type AtLeast2 = AtLeast<number, 2>;
    expectTypeOf<readonly number[]>().not.toExtend<AtLeast2>();
    expectTypeOf<readonly [number]>().not.toExtend<AtLeast2>();
  });

  it("AtLeast1 の場合に空の配列は一致しないべき", () => {
    type AtLeast1 = AtLeast<string, 1>;
    expectTypeOf<readonly []>().not.toExtend<AtLeast1>();
  });
});

describe("atLeast 関数の検証", () => {
  it("型ガードとして正しく型を絞り込めるべき", () => {
    const arr: readonly number[] = [1, 2, 3];
    if (atLeast(arr, 2)) {
      expectTypeOf(arr).toExtend<AtLeast<number, 2>>();
    }
  });
});
