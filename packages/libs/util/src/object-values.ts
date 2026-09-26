/**
 * オブジェクトのすべての値を取得します。
 * @param value - 対象のオブジェクト
 * @returns オブジェクトの値の配列
 */
export const objectValues = <T extends Record<PropertyKey, unknown>>(
  value: T,
): readonly T[keyof T][] => {
  return Object.values(value) as readonly T[keyof T][];
};
