import { type PositiveInteger } from "./positive-integer.js";

/**
 * 配列の長さが指定された最小値以上であるかを検証する型ガード関数です。
 * @template T - 配列の要素の型
 * @template U - 最小の要素数を示す数値型
 * @param value - 検証対象の配列
 * @param min - 最小の要素数（正の整数）
 * @returns 配列の長さが min 以上であれば true、そうでなければ false
 */
export const atLeast = <T, U extends number>(
  value: T[],
  min: PositiveInteger<U>,
): value is AtLeast<T, U> => {
  return value.length >= min;
};

/**
 * 少なくとも N 個の要素を持つ配列の型を表現します。
 * @template T - 配列の要素の型
 * @template N - 最小の要素数 (正の整数)
 * @template Acc - 再帰処理用の内部アキュムレータ
 */
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
