/**
 * オブジェクトのすべての値を取得します。
 * @param value - 対象のオブジェクト
 * @returns オブジェクトの値の配列
 */
export const objectValues = <T extends Record<PropertyKey, unknown>>(value: T): T[keyof T][] => {
  return Object.values(value) as T[keyof T][];
};

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;

  it("オブジェクトのすべての値を取得できること", () => {
    // Arrange
    const input = { a: 1, b: "test", c: true };

    // Act
    const result = objectValues(input);

    // Assert
    expect(result).toEqual([1, "test", true]);
  });

  it("空オブジェクトの場合は空配列が返ること", () => {
    // Arrange
    const input = {};

    // Act
    const result = objectValues(input);

    // Assert
    expect(result).toEqual([]);
  });
}
