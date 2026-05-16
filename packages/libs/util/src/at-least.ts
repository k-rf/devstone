import { type PositiveInteger } from "./positive-integer.js";

export const atLeast = <T, U extends number>(
  value: T[],
  min: PositiveInteger<U>,
): value is AtLeast<T, U> => {
  return value.length >= min;
};

export type AtLeast<T, N extends number, Acc extends T[] = []> = `${N}` extends `-${N}`
  ? []
  : Acc["length"] extends N
    ? [...Acc, ...T[]]
    : AtLeast<T, N, [...Acc, T]>;

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("正常系", () => {
    it.each([
      { array: [1, 2, 3], min: 2 as const },
      { array: [1, 2], min: 2 as const },
      { array: [1], min: 1 as const },
    ])("配列の長さ ($array.length) が min ($min) 以上のとき、true を返す", ({ array, min }) => {
      expect(atLeast(array, min)).toBe(true);
    });

    it.each([
      { array: [1], min: 2 as const },
      { array: [], min: 1 as const },
    ])("配列の長さ ($array.length) が min ($min) 未満のとき、false を返す", ({ array, min }) => {
      expect(atLeast(array, min)).toBe(false);
    });
  });
}
