import { Schema } from "effect";
import { expect, it } from "vitest";

import { TaskBoardItemId } from "./task-board-item-id.js";

it("有効な文字列を TaskBoardItemId として検証できること", () => {
  const id = "page-id-123";
  const result = Schema.decodeSync(TaskBoardItemId)(id);
  expect(result).toBe(id);
});

it("空文字は検証に失敗すること", () => {
  expect(() => Schema.decodeSync(TaskBoardItemId)("")).toThrow();
});

it("文字列以外の値は検証に失敗すること", () => {
  // @ts-expect-error 型定義により string 以外は受け付けないが、実行時のバリデーションを検証するため
  expect(() => Schema.decodeSync(TaskBoardItemId)(123)).toThrow();
});
