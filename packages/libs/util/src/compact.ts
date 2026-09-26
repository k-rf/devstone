/**
 * オブジェクトから undefined のプロパティを取り除いた新しいオブジェクトを返します。
 * @param obj - 対象のオブジェクト
 * @returns undefined のプロパティが除外されたオブジェクト
 */
export const compact = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
};
