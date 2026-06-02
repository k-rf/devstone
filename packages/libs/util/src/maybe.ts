import { compact } from "./compact.js";
import { objectValues } from "./object-values.js";
import { type SingleValueObject } from "./single-value-object.js";

/**
 * オブジェクトが有効なプロパティ（undefined 以外の値）を持っているか検証し、
 * 持っていればそのオブジェクトを、持っていなければ undefined を返します。
 * @template T - 対象のオブジェクトの型
 * @template K - オブジェクトのキーの型
 * @param value - 単一プロパティからなるオブジェクト
 * @returns 有効な値が存在する場合はそのオブジェクト、空もしくは undefined のみの場合は undefined
 */
export const maybe = <T extends Record<PropertyKey, unknown>, K extends keyof T = keyof T>(
  value: SingleValueObject<T>,
): Record<K, NonNullable<T[K]>> | undefined => {
  return objectValues(compact(value)).length === 0
    ? undefined
    : (value as Record<K, NonNullable<T[K]>>);
};

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;

  it("空オブジェクトの場合は undefined を返すこと", () => {
    // Arrange
    const input = {};

    // Act
    const result = maybe(input);

    // Assert
    expect(result).toBeUndefined();
  });

  it("プロパティが undefined の場合は undefined を返すこと", () => {
    // Arrange
    const input = { a: undefined };

    // Act
    const result = maybe(input);

    // Assert
    expect(result).toBeUndefined();
  });

  it("プロパティを持つオブジェクトの場合はそのオブジェクトを返すこと", () => {
    // Arrange
    const input = { a: 1 };

    // Act
    const result = maybe(input);

    // Assert
    expect(result).toEqual(input);
  });
}
