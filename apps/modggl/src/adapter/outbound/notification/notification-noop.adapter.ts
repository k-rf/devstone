import { Effect, Layer } from "effect";

import { NotificationPort } from "../../../core/port/outbound/notification/notification.port.js";

/**
 * 通知を行わない Noop 実装の `NotificationPort` Layer
 */
export const NotificationNoopLive: Layer.Layer<NotificationPort> = Layer.succeed(NotificationPort, {
  notifyCompleted: () => Effect.void,
  notifyAborted: () => Effect.void,
  notifyError: () => Effect.void,
});
