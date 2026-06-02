/**
 * 与えられた値が正の整数であることを型レベルで保証する関数です。
 * @template T - 対象の数値型
 * @param value - 正の整数であるべき値
 * @returns 引数として渡された値
 */
export const positiveInteger = <T extends number>(value: PositiveInteger<T>) => {
  return value;
};

/**
 * 正の整数のみを許容する型制約を表現します。
 * 0、負の数、小数は `never` として扱われます。
 * @template T - 対象の数値型
 */
export type PositiveInteger<T extends number> = `${T}` extends
  | `-${number}`
  | "0"
  | `${number}.${number}`
  ? never
  : T;

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

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
}
