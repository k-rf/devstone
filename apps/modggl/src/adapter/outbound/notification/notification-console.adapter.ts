import { Console, DateTime, Layer, Option } from "effect";

import { NotificationPort } from "../../../core/port/outbound/notification/notification.port.js";

/**
 * 通知イベントを標準エラー出力へ構造化ログとして出力する `NotificationPort` Layer
 */
export const NotificationConsoleLive: Layer.Layer<NotificationPort> = Layer.succeed(
  NotificationPort,
  {
    notifyCompleted: (notification) =>
      Console.error(
        JSON.stringify({
          notification: "completed",
          status: notification.status,
          since: DateTime.formatIso(notification.since),
          until: DateTime.formatIso(notification.until),
          fetchedCount: notification.fetchedCount,
          excludedCount: notification.excludedCount,
          modifiedCount: notification.modifications.length,
          deletedCount: notification.deletedIds.length,
          quotaRemaining: Option.getOrUndefined(notification.quotaRemaining),
          quotaResetsInSeconds: Option.getOrUndefined(notification.quotaResetsInSeconds),
        }),
      ),
    notifyAborted: (notification) =>
      Console.error(
        JSON.stringify({
          notification: "aborted",
          reason: notification.reason,
          firstId: notification.first.id,
          secondId: notification.second.id,
        }),
      ),
    notifyError: (notification) =>
      Console.error(
        JSON.stringify({
          notification: "error",
          reason: notification.reason,
          message: notification.message,
          status: Option.getOrUndefined(notification.status),
          resetsInSeconds: Option.getOrUndefined(notification.resetsInSeconds),
        }),
      ),
  },
);
