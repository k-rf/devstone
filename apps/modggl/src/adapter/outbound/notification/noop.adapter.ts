import { Effect, Layer } from "effect";

import { NotificationPort } from "../../../core/port/outbound/notification/notification.port.js";

/**
 * 通知を行わない Noop 実装の `NotificationPort` Layer
 */
export const NotificationNoopAdapterLive: Layer.Layer<NotificationPort> = Layer.succeed(
  NotificationPort,
  {
    notifyCompleted: () => Effect.void,
    notifyAborted: () => Effect.void,
    notifyError: () => Effect.void,
  },
);
