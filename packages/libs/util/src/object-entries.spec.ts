import { expect, it } from "vitest";

import { objectEntries } from "./object-entries.js";

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
