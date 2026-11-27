import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { DateTime, Effect, Option } from "effect";
import { expect, it, vi } from "vitest";

import { NotificationPort } from "../../../core/port/outbound/notification/notification.port.js";

import { NotificationConsoleLive } from "./notification-console.adapter.js";

const entry = (id: number) => ({
  id: id,
  interval: TimeInterval.make({
    start: TimeInstant.make(1_764_234_000_000),
    end: TimeInstant.make(1_764_237_600_000),
  }),
  type: "activity" as const,
  taskId: Option.none(),
  projectId: Option.none(),
  clientId: Option.none(),
  description: "",
  tagIds: [],
  billable: false,
  hasScheduleBinding: false,
});

it("NotificationConsoleLive が完了・停止・エラー通知を構造化 JSON で stderr へ出力すること", async () => {
  const errorSpy = vi.fn<(...args: readonly unknown[]) => void>();

  const program = Effect.consoleWith((baseConsole) =>
    Effect.gen(function* () {
      const port = yield* NotificationPort;
      yield* port.notifyCompleted({
        status: "completed",
        since: DateTime.unsafeMake("2026-11-20T00:00:00Z"),
        until: DateTime.unsafeMake("2026-11-28T00:00:00Z"),
        fetchedCount: 5,
        excludedCount: 1,
        modifications: [],
        deletedIds: [2],
        quotaRemaining: Option.some(25),
        quotaResetsInSeconds: Option.some(1800),
      });
      yield* port.notifyAborted({
        reason: "NotDetermine",
        first: entry(1),
        second: entry(2),
      });
      yield* port.notifyError({
        message: "quota exceeded",
        reason: "QuotaExceeded",
        status: Option.some(402),
        resetsInSeconds: Option.some(900),
      });
    }).pipe(
      Effect.provide(NotificationConsoleLive),
      Effect.withConsole({
        ...baseConsole,
        error: (...args: readonly unknown[]) =>
          Effect.sync(() => {
            errorSpy(...args);
          }),
      }),
    ),
  );

  await Effect.runPromise(program);

  expect(errorSpy).toHaveBeenCalledTimes(3);
  const firstCall: unknown = JSON.parse(String(errorSpy.mock.calls[0]?.[0]));
  const secondCall: unknown = JSON.parse(String(errorSpy.mock.calls[1]?.[0]));
  const thirdCall: unknown = JSON.parse(String(errorSpy.mock.calls[2]?.[0]));

  expect(firstCall).toMatchObject({
    notification: "completed",
    status: "completed",
    fetchedCount: 5,
    excludedCount: 1,
    deletedCount: 1,
    quotaRemaining: 25,
    quotaResetsInSeconds: 1800,
  });
  expect(secondCall).toStrictEqual({
    notification: "aborted",
    reason: "NotDetermine",
    firstId: 1,
    secondId: 2,
  });
  expect(thirdCall).toStrictEqual({
    notification: "error",
    reason: "QuotaExceeded",
    message: "quota exceeded",
    status: 402,
    resetsInSeconds: 900,
  });
});
