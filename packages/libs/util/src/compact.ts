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

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;

  it("undefined プロパティが除外されること", () => {
    // Arrange
    const input = { a: 1, b: undefined, c: "test" };

    // Act
    const result = compact(input);

    // Assert
    expect(result).toEqual({ a: 1, c: "test" });
  });

  it("false や 0 など undefined 以外の falsy な値は維持されること", () => {
    // Arrange
    const input = { b: false, c: 0, d: "" };

    // Act
    const result = compact(input);

    // Assert
    expect(result).toEqual({ b: false, c: 0, d: "" });
  });

  it("空のオブジェクトを渡した場合は空のオブジェクトが返ること", () => {
    // Arrange
    const input = {};

    // Act
    const result = compact(input);

    // Assert
    expect(result).toEqual({});
  });
}
