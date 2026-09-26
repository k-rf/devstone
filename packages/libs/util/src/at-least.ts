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
  value: readonly T[],
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
export type AtLeast<
  T,
  N extends number,
  Acc extends readonly T[] = readonly [],
> = `${N}` extends `-${N}`
  ? readonly []
  : Acc["length"] extends N
    ? readonly [...Acc, ...(readonly T[])]
    : AtLeast<T, N, readonly [...Acc, T]>;
