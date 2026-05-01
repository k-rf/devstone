import { Schema } from "effect";

export const TaskBoardItemIdBrand: unique symbol = Symbol.for("TaskBoardItemId");

/**
 * タスクボードアイテムの識別子 (Branded Type)
 * unique symbol を用いることで、他の文字列型との混同を物理的に排除する
 */
export const TaskBoardItemId = Schema.String.pipe(Schema.brand(TaskBoardItemIdBrand));

export type TaskBoardItemId = Schema.Schema.Type<typeof TaskBoardItemId>;

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("有効な文字列を TaskBoardItemId として検証できること", () => {
    const id = "page-id-123";
    const result = Schema.decodeSync(TaskBoardItemId)(id);
    expect(result).toBe(id);
  });

  it("文字列以外の値は検証に失敗すること", () => {
    // @ts-expect-error 型定義により string 以外は受け付けないが、実行時のバリデーションを検証するため
    expect(() => Schema.decodeSync(TaskBoardItemId)(123)).toThrow();
  });
}
