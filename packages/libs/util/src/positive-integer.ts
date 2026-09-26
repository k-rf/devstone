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
