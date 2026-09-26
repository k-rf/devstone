import { expect, it } from "vitest";

import { objectKeys } from "./object-keys.js";

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
