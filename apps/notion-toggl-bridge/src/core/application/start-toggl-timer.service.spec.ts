import { Effect, Layer } from "effect";
import { describe, expect, it, vi } from "vitest";

import { type TaskBoardItemId } from "../domain/task-board-item-id";
import { TaskBoardPort } from "../port/outbound/notion/task-board.port";
import { NotificationPort } from "../port/outbound/slack/notification.port";
import { TimeTrackerPort } from "../port/outbound/toggl/time-tracker.port";

import { startTogglTimerService } from "./start-toggl-timer.service";

describe("startTogglTimerService", () => {
  it("タスクが見つかった場合、タイマーを開始すること", async () => {
    // Arrange
    const mockItem = {
      id: "page-123" as TaskBoardItemId,
      parentDatabaseId: "db-123",
      title: "Test Task",
      category: "Client / Project",
      tags: ["Tag1"],
    };

    const TaskBoardPortTest = Layer.succeed(TaskBoardPort, {
      getItem: () => Effect.succeed(mockItem),
    });

    const startTimerSpy = vi.fn(() => Effect.void);
    const TimeTrackerPortTest = Layer.succeed(TimeTrackerPort, {
      startTimer: startTimerSpy,
    });

    const NotificationPortTest = Layer.succeed(NotificationPort, {
      notifyError: () => Effect.void,
    });

    const layer = TaskBoardPortTest.pipe(
      Layer.merge(TimeTrackerPortTest),
      Layer.merge(NotificationPortTest),
    );

    // Act
    await Effect.runPromise(
      startTogglTimerService(mockItem.id, "block-123").pipe(Effect.provide(layer)),
    );

    // Assert
    expect(startTimerSpy).toHaveBeenCalledWith(mockItem);
  });

  it("タスクの取得に失敗した場合、エラーを通知すること", async () => {
    // Arrange
    const TaskBoardPortTest = Layer.succeed(TaskBoardPort, {
      // @ts-expect-error 意図的に失敗をシミュレートするために不完全なエラーオブジェクトを渡す
      getItem: () => Effect.fail({ message: "Not found" }),
    });

    const notifyErrorSpy = vi.fn(() => Effect.void);
    const NotificationPortTest = Layer.succeed(NotificationPort, {
      notifyError: notifyErrorSpy,
    });

    const TimeTrackerPortTest = Layer.succeed(TimeTrackerPort, {
      startTimer: () => Effect.void,
    });

    const layer = TaskBoardPortTest.pipe(
      Layer.merge(NotificationPortTest),
      Layer.merge(TimeTrackerPortTest),
    );

    // Act
    const action = Effect.runPromise(
      startTogglTimerService("page-123" as TaskBoardItemId, "block-123").pipe(
        Effect.provide(layer),
      ),
    );

    // Assert
    await expect(action).rejects.toThrow();

    expect(notifyErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to start timer: Not found"),
      expect.anything(),
    );
  });
});
