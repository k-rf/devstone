import { Command } from "@effect/cli";
import { Console, Context, Effect, Layer, Match, Option } from "effect";

import { EnvValidationError, loadEnv } from "../../../config/load-env.js";
import { ModifyEntriesInput } from "../../../core/application/modify-entries.input.js";
import { modifyEntriesWorkflow } from "../../../core/application/modify-entries.workflow.js";
import {
  NotificationPort,
  type NotificationError,
} from "../../../core/port/outbound/notification/notification.port.js";
import { DiscordAdapterLive } from "../../outbound/discord/discord.adapter.js";
import { NotificationNoopAdapterLive } from "../../outbound/notification/noop.adapter.js";
import { Toggl2AdapterLive } from "../../outbound/toggl/toggl-2.adapter.js";

import { daysOption } from "./days.option.js";
import { dryRunOption } from "./dry-run.option.js";
import { notifyOption } from "./notify.option.js";
import { formatErrorJson } from "./run-error.payload.js";
import { formatSuccessJson } from "./run-success.payload.js";
import { sinceOption } from "./since.option.js";
import { untilOption } from "./until.option.js";

const logNotificationWarning = (error: NotificationError) => Console.error(formatErrorJson(error));

const withNotificationWarningLog = (
  layer: Layer.Layer<NotificationPort>,
): Layer.Layer<NotificationPort> =>
  layer.pipe(
    Layer.map((context) => {
      const port = Context.get(context, NotificationPort);

      return Context.make(NotificationPort, {
        notifyCompleted: (notification) =>
          port.notifyCompleted(notification).pipe(Effect.tapError(logNotificationWarning)),
        notifyAborted: (notification) =>
          port.notifyAborted(notification).pipe(Effect.tapError(logNotificationWarning)),
        notifyError: (notification) =>
          port.notifyError(notification).pipe(Effect.tapError(logNotificationWarning)),
      });
    }),
  );

const resolveNotificationLayer = (
  shouldNotify: boolean,
  discordWebhookUrl: Option.Option<string>,
): Effect.Effect<Layer.Layer<NotificationPort>, EnvValidationError> =>
  Match.value(shouldNotify).pipe(
    Match.when(false, () => Effect.succeed(NotificationNoopAdapterLive)),
    Match.when(true, () =>
      Option.match(discordWebhookUrl, {
        onNone: () =>
          Effect.fail(
            new EnvValidationError({
              message:
                "環境変数の検証に失敗しました: 通知が有効なため DISCORD_WEBHOOK_URL が必要です",
              cause: "Missing DISCORD_WEBHOOK_URL",
            }),
          ),
        onSome: (url) => Effect.succeed(withNotificationWarningLog(DiscordAdapterLive(url))),
      }),
    ),
    Match.exhaustive,
  );

/**
 * Toggl 2.0 タイムエントリーの補正を実行するルート CLI コマンド
 */
export const runCommand = Command.make("modggl", {
  since: sinceOption,
  until: untilOption,
  days: daysOption,
  dryRun: dryRunOption,
  notify: notifyOption,
}).pipe(
  Command.withDescription("Normalize, merge, and fill gaps in Toggl 2.0 time entries"),
  Command.withHandler(({ since, until, days, dryRun, notify }) => {
    const shouldNotify = Option.getOrElse(notify, () => !dryRun);

    return loadEnv().pipe(
      Effect.flatMap((env) =>
        resolveNotificationLayer(shouldNotify, env.discordWebhookUrl).pipe(
          Effect.map((notificationLayer) => ({ env: env, notificationLayer: notificationLayer })),
        ),
      ),
      Effect.flatMap(({ env, notificationLayer }) =>
        modifyEntriesWorkflow(
          ModifyEntriesInput.make({
            since: since,
            until: until,
            days: days,
            dryRun: dryRun,
          }),
        ).pipe(
          Effect.provide(
            Layer.mergeAll(
              Toggl2AdapterLive({
                apiToken: env.togglApiToken,
                organizationId: env.togglOrganizationId,
                workspaceId: env.togglWorkspaceId,
              }),
              notificationLayer,
            ),
          ),
        ),
      ),
      Effect.tap((output) => Console.log(formatSuccessJson(output))),
      Effect.tapError((error) => Console.error(formatErrorJson(error))),
    );
  }),
);
