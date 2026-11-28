import { Schema } from "effect";

/**
 * タスク ID（正の整数）を表すブランド付きスキーマ
 */
export const TaskId = Schema.Int.pipe(
  Schema.positive(),
  Schema.brand("TaskId", {
    identifier: "TaskId",
    description: "タスク ID（正の整数）",
  }),
);

/**
 * タスク ID を表すブランド型
 */
export type TaskId = typeof TaskId.Type;
