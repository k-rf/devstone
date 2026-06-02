/**
 * オブジェクトのすべてのキーを取得します。
 * @param value - 対象のオブジェクト
 * @returns オブジェクトのキーの配列
 */
export const objectKeys = <T extends Record<PropertyKey, unknown>>(value: T): (keyof T)[] => {
  return Object.keys(value);
};

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;

  it("オブジェクトのすべてのキーを取得できること", () => {
    // Arrange
    const input = { a: 1, b: "test", c: true };

    // Act
    const result = objectKeys(input);

    // Assert
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("空オブジェクトの場合は空配列が返ること", () => {
    // Arrange
    const input = {};

    // Act
    const result = objectKeys(input);

    // Assert
    expect(result).toEqual([]);
  });
}
