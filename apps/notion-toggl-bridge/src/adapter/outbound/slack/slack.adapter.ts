import { Effect, Layer } from "effect";

import {
  NotificationError,
  NotificationPort,
} from "../../../core/port/outbound/slack/notification.port";

/**
 * Slack Notification Adapter の実装
 * @param webhookUrl - Slack Webhook URL
 * @returns Slack Notification Adapter の Layer
 */
export const SlackAdapterLive = (webhookUrl: string) =>
  Layer.succeed(NotificationPort, {
    notifyError: (message, details) =>
      Effect.gen(function* () {
        const payload = {
          text: `🚨 *Notion-Toggl Bridge Error*\n${message}`,
          attachments: details
            ? [
                {
                  color: "danger",
                  fields: Object.entries(details).map(([key, value]) => ({
                    title: key,
                    value: typeof value === "string" ? value : JSON.stringify(value),
                    short: true,
                  })),
                },
              ]
            : [],
        };

        yield* Effect.tryPromise({
          try: () =>
            fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            }),
          catch: (e) =>
            new NotificationError({
              message: `Slack notification network error`,
              cause: e,
            }),
        });
      }).pipe(
        Effect.catchAll((error) => {
          console.error("Failed to notify Slack:", error);
          return Effect.void;
        }),
      ),
  });
