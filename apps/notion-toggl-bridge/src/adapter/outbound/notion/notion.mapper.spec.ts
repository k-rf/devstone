import { expect, it } from "vitest";

import { normalizeRichText } from "./notion.mapper.js";

it("リッチテキストを正常にプレーンテキストに変換できること", () => {
  const input = [{ plain_text: "Hello " }, { plain_text: "World" }];
  expect(normalizeRichText(input)).toBe("Hello World");
});

it("plain_text プロパティがない要素は無視されること", () => {
  const input = [{ plain_text: "Valid" }, { something_else: "Invalid" }, undefined, 123];
  expect(normalizeRichText(input)).toBe("Valid");
});
