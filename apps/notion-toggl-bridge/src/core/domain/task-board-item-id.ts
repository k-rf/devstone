import { Schema } from "effect";

const TaskBoardItemIdBrand: unique symbol = Symbol.for("TaskBoardItemId");

/**
 * タスクボードアイテムの識別子 (Branded Type)
 * unique symbol を用いることで、他の文字列型との混同を物理的に排除する
 */
export const TaskBoardItemId = Schema.String.pipe(
  Schema.minLength(1),
  Schema.brand(TaskBoardItemIdBrand),
);

export type TaskBoardItemId = Schema.Schema.Type<typeof TaskBoardItemId>;
