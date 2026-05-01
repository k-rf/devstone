import { Context, Data, type Effect } from "effect";

import { type TaskBoardItem } from "../../../domain/task-board-item";
import { type TaskBoardItemId } from "../../../domain/task-board-item-id";

/**
 * タスクボード関連のエラー
 */
export class TaskBoardError extends Data.TaggedError("TaskBoardError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class TaskBoardPort extends Context.Tag("TaskBoardPort")<
  TaskBoardPort,
  {
    readonly getItem: (id: TaskBoardItemId) => Effect.Effect<TaskBoardItem, TaskBoardError>;
  }
>() {}
