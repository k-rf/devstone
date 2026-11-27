import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { DateTime, Effect, Option } from "effect";
import { expect, it } from "vitest";

import { NotificationPort } from "../../../core/port/outbound/notification/notification.port.js";

import { NotificationNoopLive } from "./notification-noop.adapter.js";

const entry = {
  id: 1,
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
};

it("NotificationNoopLive がすべての通知メソッドでエラーなく完了すること", async () => {
  const program = Effect.gen(function* () {
    const port = yield* NotificationPort;
    yield* port.notifyCompleted({
      status: "no_changes",
      since: DateTime.unsafeMake("2026-11-20T00:00:00Z"),
      until: DateTime.unsafeMake("2026-11-28T00:00:00Z"),
      fetchedCount: 0,
      excludedCount: 0,
      modifications: [],
      deletedIds: [],
      quotaRemaining: Option.none(),
      quotaResetsInSeconds: Option.none(),
    });
    yield* port.notifyAborted({
      reason: "NotDetermine",
      first: entry,
      second: entry,
    });
    yield* port.notifyError({
      message: "error",
      reason: "ApiError",
      status: Option.none(),
      resetsInSeconds: Option.none(),
    });
  }).pipe(Effect.provide(NotificationNoopLive));

  await expect(Effect.runPromise(program)).resolves.toBeUndefined();
});
