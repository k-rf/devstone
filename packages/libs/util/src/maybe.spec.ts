import { expect, it } from "vitest";

import { maybe } from "./maybe.js";

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
