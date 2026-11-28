import { getIntervalDurationSeconds } from "@devstone/libs-time-interval";
import { Command } from "@effect/cli";
import { Console, DateTime, Effect, Layer, Match, Option } from "effect";

import { type ModifyEntriesOutput } from "../../../core/application/modify-entries.output.js";
import {
  modifyEntriesWorkflow,
  type ModifyEntriesWorkflowError,
} from "../../../core/application/modify-entries.workflow.js";
import { type TimeEntry } from "../../../core/domain/time-entry.js";
import { type NotificationPort } from "../../../core/port/outbound/notification/notification.port.js";
import { DiscordAdapterLive } from "../../outbound/discord/discord.adapter.js";
import { NotificationNoopLive } from "../../outbound/notification/notification-noop.adapter.js";
import { Toggl2AdapterLive } from "../../outbound/toggl/toggl-2.adapter.js";

import { daysOption } from "./days.option.js";
import { dryRunOption } from "./dry-run.option.js";
import { EnvValidationError, loadEnv } from "./env.middleware.js";
import { notifyOption } from "./notify.option.js";
import { sinceOption } from "./since.option.js";
import { untilOption } from "./until.option.js";

const formatIsoMillis = (epochMillis: number): string =>
  DateTime.formatIso(DateTime.unsafeMake(epochMillis));

const serializeTimeEntry = (entry: TimeEntry) => ({
  id: entry.id,
  start: formatIsoMillis(entry.interval.start),
  end: formatIsoMillis(entry.interval.end),
  durationSeconds: getIntervalDurationSeconds(entry.interval),
  type: entry.type,
  taskId: Option.getOrUndefined(entry.taskId),
  projectId: Option.getOrUndefined(entry.projectId),
  clientId: Option.getOrUndefined(entry.clientId),
  description: entry.description,
  tagIds: entry.tagIds,
  billable: entry.billable,
  hasScheduleBinding: entry.hasScheduleBinding,
});

const formatSuccessJson = (output: ModifyEntriesOutput): string =>
  JSON.stringify({
    status: output.status,
    since: DateTime.formatIso(output.since),
    until: DateTime.formatIso(output.until),
    stats: output.stats,
    modifications: output.modifications.map((modification) => ({
      id: modification.id,
      start: formatIsoMillis(modification.interval.start),
      end: formatIsoMillis(modification.interval.end),
      durationSeconds: getIntervalDurationSeconds(modification.interval),
    })),
    deletedIds: output.deletedIds,
    quota: {
      remaining: Option.getOrUndefined(output.quota.remaining),
      resetsInSeconds: Option.getOrUndefined(output.quota.resetsInSeconds),
    },
  });

const formatErrorJson = (error: ModifyEntriesWorkflowError | EnvValidationError): string =>
  Match.value(error).pipe(
    Match.tag("ModifyEntriesAbortedError", (aborted) =>
      JSON.stringify({
        status: "aborted",
        reason: aborted.reason,
        message: aborted.message,
        stats: {
          fetchedCount: aborted.fetchedCount,
          excludedCount: aborted.excludedCount,
          processedCount: aborted.processedCount,
        },
        first: serializeTimeEntry(aborted.first),
        second: serializeTimeEntry(aborted.second),
        quota: {
          remaining: Option.getOrUndefined(aborted.quotaRemaining),
          resetsInSeconds: Option.getOrUndefined(aborted.quotaResetsInSeconds),
        },
      }),
    ),
    Match.tag("TimeEntriesError", (apiError) =>
      JSON.stringify({
        status: "error",
        error: apiError._tag,
        reason: apiError.reason,
        message: apiError.message,
        httpStatus: Option.getOrUndefined(apiError.status),
        resetsInSeconds: Option.getOrUndefined(apiError.resetsInSeconds),
      }),
    ),
    Match.tag("InvalidDateRangeError", (rangeError) =>
      JSON.stringify({
        status: "error",
        error: rangeError._tag,
        message: rangeError.message,
        since: DateTime.formatIso(rangeError.since),
        until: DateTime.formatIso(rangeError.until),
      }),
    ),
    Match.tag("EnvValidationError", (envError) =>
      JSON.stringify({
        status: "error",
        error: envError._tag,
        message: envError.message,
      }),
    ),
    Match.exhaustive,
  );

const resolveNotificationLayer = (
  shouldNotify: boolean,
  discordWebhookUrl: Option.Option<string>,
): Effect.Effect<Layer.Layer<NotificationPort>, EnvValidationError> =>
  Match.value(shouldNotify).pipe(
    Match.when(false, () => Effect.succeed(NotificationNoopLive)),
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
        onSome: (url) => Effect.succeed(DiscordAdapterLive(url)),
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
        modifyEntriesWorkflow({
          since: since,
          until: until,
          days: days,
          dryRun: dryRun,
          notify: shouldNotify,
        }).pipe(
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
      Effect.catchAll((error) =>
        Console.error(formatErrorJson(error)).pipe(Effect.andThen(Effect.fail(error))),
      ),
    );
  }),
);
