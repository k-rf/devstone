import { Effect } from "effect";

import { type TaskBoardItemId } from "../domain/task-board-item-id";
import { TaskBoardPort } from "../port/outbound/notion/task-board.port";
import { NotificationPort } from "../port/outbound/slack/notification.port";
import { TimeTrackerPort } from "../port/outbound/toggl/time-tracker.port";

/**
 * タイムトラッキングを開始するユースケース
 * @param todoPageId - 開始対象となる Notion 側のタスクページ ID
 * @param timeBlockId - ボタンが押下されたタイムブロックのページ ID
 * @returns 処理結果を示す Effect
 */
export const startTogglTimerService = (todoPageId: TaskBoardItemId, timeBlockId: string) =>
  Effect.gen(function* () {
    const taskBoard = yield* TaskBoardPort;
    const timeTracker = yield* TimeTrackerPort;

    // 1. タスクボードからアイテムを取得
    const item = yield* taskBoard.getItem(todoPageId);

    // 2. タイムトラッカーでタイマーを開始
    yield* timeTracker.startTimer(item);
  }).pipe(
    Effect.tapError((error) =>
      Effect.gen(function* () {
        const notification = yield* NotificationPort;
        yield* notification.notifyError(`Failed to start timer: ${error.message}`, {
          todoPageId: todoPageId,
          timeBlockId: timeBlockId,
          error: error._tag,
        });
      }),
    ),
  );
