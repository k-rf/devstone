import { expect, it } from "vitest";

import { objectValues } from "./object-values.js";

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
