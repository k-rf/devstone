/**
 * オブジェクトのすべてのキーを取得します。
 * @param value - 対象のオブジェクト
 * @returns オブジェクトのキーの配列
 */
export const objectKeys = <T extends Record<PropertyKey, unknown>>(
  value: T,
): readonly (keyof T)[] => {
  return Object.keys(value);
};
