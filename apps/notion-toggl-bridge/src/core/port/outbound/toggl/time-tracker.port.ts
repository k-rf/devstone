import { Context, Data, type Effect } from "effect";

import { type TaskBoardItem } from "../../../domain/task-board-item";

/**
 * タイムトラッカー関連のエラー
 */
export class TimeTrackerError extends Data.TaggedError("TimeTrackerError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class TimeTrackerPort extends Context.Tag("TimeTrackerPort")<
  TimeTrackerPort,
  {
    readonly startTimer: (item: TaskBoardItem) => Effect.Effect<void, TimeTrackerError>;
  }
>() {}
