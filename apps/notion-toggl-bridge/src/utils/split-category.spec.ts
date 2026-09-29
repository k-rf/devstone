import { expect, it } from "vitest";

import { splitCategory } from "./split-category.js";

it("カテゴリ文字列を親と子に分割できること", () => {
  const result = splitCategory("Client / Project");
  expect(result).toEqual({ parent: "Client", child: "Project" });
});

it("複数のスラッシュがある場合、最初以外を子にまとめること", () => {
  const result = splitCategory("Client / Sub / Project");
  expect(result).toEqual({ parent: "Client", child: "Sub/Project" });
});

it("不正な形式の場合は undefined を返すこと", () => {
  expect(splitCategory("InvalidFormat")).toBeUndefined();
  expect(splitCategory("Empty /")).toBeUndefined();
  expect(splitCategory("/ Empty")).toBeUndefined();
});
