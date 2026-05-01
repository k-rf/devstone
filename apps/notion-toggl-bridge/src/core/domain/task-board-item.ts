import { Schema } from "effect";

import { TaskBoardItemId } from "./task-board-item-id";

/**
 * タスクボード上のアイテム (作業項目)
 */
export const TaskBoardItem = Schema.Struct({
  id: TaskBoardItemId,
  parentDatabaseId: Schema.String,
  title: Schema.String,
  category: Schema.String,
  tags: Schema.Array(Schema.String),
});

export type TaskBoardItem = Schema.Schema.Type<typeof TaskBoardItem>;
