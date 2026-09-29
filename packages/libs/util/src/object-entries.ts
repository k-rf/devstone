type ObjectEntries<T extends Record<PropertyKey, unknown>> = readonly {
  readonly [K in keyof T]: readonly [key: K, value: T[K]];
}[keyof T][];

/**
 * オブジェクトのすべてのエントリー（キーと値のペア）を取得します。
 * @param value - 対象のオブジェクト
 * @returns オブジェクトのエントリーの配列
 */
export const objectEntries = <T extends Record<PropertyKey, unknown>>(
  value: T,
): ObjectEntries<T> => {
  return Object.entries(value) as ObjectEntries<T>;
};
