type ObjectEntries<T extends Record<PropertyKey, unknown>> = {
  [K in keyof T]: [key: K, value: T[K]];
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

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;

  it("オブジェクトのすべてのエントリーを取得できること", () => {
    // Arrange
    const input = { a: 1, b: "test" };

    // Act
    const result = objectEntries(input);

    // Assert
    expect(result).toEqual([
      ["a", 1],
      ["b", "test"],
    ]);
  });

  it("空オブジェクトの場合は空配列が返ること", () => {
    // Arrange
    const input = {};

    // Act
    const result = objectEntries(input);

    // Assert
    expect(result).toEqual([]);
  });
}
