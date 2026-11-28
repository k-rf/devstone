import { Effect, Match, Option } from "effect";

import { reviseEntries } from "../domain/revise-entries.js";
import { type RevisionPlanned } from "../domain/revision-plan.js";
import { sortTimeEntries } from "../domain/sort-time-entries.js";
import {
  NotificationPort,
  type ModifyEntriesStatus,
} from "../port/outbound/notification/notification.port.js";
import {
  TimeEntriesPort,
  type QuotaInfo,
  type TimeEntriesError,
} from "../port/outbound/toggl/time-entries.port.js";

import { type ModifyEntriesInput } from "./modify-entries.input.js";
import {
  ModifyEntriesAbortedError,
  type InvalidDateRangeError,
  type ModifyEntriesOutput,
} from "./modify-entries.output.js";
import { resolveDateRangeActivity } from "./resolve-date-range.activity.js";

/**
 * タイムエントリー補正ユースケースで発生しうるエラーのユニオン型
 */
export type ModifyEntriesWorkflowError =
  | InvalidDateRangeError
  | ModifyEntriesAbortedError
  | TimeEntriesError;

type TimeEntriesService = Effect.Effect.Success<typeof TimeEntriesPort>;

const applyPlannedChanges = (
  timeEntriesPort: TimeEntriesService,
  plan: RevisionPlanned,
  dryRun: boolean,
  initialQuota: QuotaInfo,
): Effect.Effect<
  { readonly status: ModifyEntriesStatus; readonly quota: QuotaInfo },
  TimeEntriesError
> =>
  Effect.gen(function* () {
    const hasModifications = plan.modifications.length > 0;
    const hasDeletions = plan.deletions.length > 0;

    if (dryRun || (!hasModifications && !hasDeletions)) {
      return {
        status: dryRun ? ("dry_run" as const) : ("no_changes" as const),
        quota: initialQuota,
      };
    }

    const patchQuota = hasModifications
      ? yield* timeEntriesPort.updateEntries(plan.modifications)
      : Option.none<QuotaInfo>();

    const deleteQuota = hasDeletions
      ? yield* timeEntriesPort.deleteEntries(plan.deletions)
      : Option.none<QuotaInfo>();

    const latestQuota = Option.orElse(deleteQuota, () => patchQuota);

    return {
      status: "completed" as const,
      quota: Option.getOrElse(latestQuota, () => initialQuota),
    };
  });

const notifyFailure = (
  error: ModifyEntriesWorkflowError,
): Effect.Effect<void, never, NotificationPort> =>
  NotificationPort.pipe(
    Effect.flatMap((notificationPort) =>
      Match.value(error).pipe(
        Match.tag("ModifyEntriesAbortedError", (aborted) =>
          notificationPort
            .notifyAborted({
              reason: aborted.reason,
              first: aborted.first,
              second: aborted.second,
            })
            .pipe(Effect.catchAll(() => Effect.void)),
        ),
        Match.tag("TimeEntriesError", (apiError) =>
          notificationPort
            .notifyError({
              message: apiError.message,
              reason: apiError.reason,
              status: apiError.status,
              resetsInSeconds: apiError.resetsInSeconds,
            })
            .pipe(Effect.catchAll(() => Effect.void)),
        ),
        Match.tag("InvalidDateRangeError", () => Effect.void),
        Match.exhaustive,
      ),
    ),
  );

/**
 * タイムエントリーを取得し、同一エントリーのマージ・隙間補完・重複解消を All-or-Nothing で実行する Workflow
 * @param input - 取得期間・ドライラン設定の入力データ
 * @returns 実行サマリーおよび適用された変更計画、またはエラーを返す Effect
 */
export const modifyEntriesWorkflow = (
  input: ModifyEntriesInput,
): Effect.Effect<
  ModifyEntriesOutput,
  ModifyEntriesWorkflowError,
  TimeEntriesPort | NotificationPort
> =>
  Effect.gen(function* () {
    const { since, until } = yield* resolveDateRangeActivity({
      since: input.since,
      until: input.until,
      days: input.days,
    });

    const timeEntriesPort = yield* TimeEntriesPort;
    const notificationPort = yield* NotificationPort;

    const fetched = yield* timeEntriesPort.listEntries({ since: since, until: until });
    const sortedEntries = sortTimeEntries(fetched.entries);
    const plan = reviseEntries(sortedEntries);

    if (plan._tag === "Aborted") {
      return yield* Effect.fail(
        new ModifyEntriesAbortedError({
          message: `時間重複の解決を機械決定できないため処理を停止しました (${plan.reason})`,
          reason: plan.reason,
          first: plan.first,
          second: plan.second,
          stats: {
            fetchedCount: fetched.fetchedCount,
            excludedCount: fetched.excludedCount,
            processedCount: sortedEntries.length,
          },
          quota: fetched.quota,
        }),
      );
    }

    const { status, quota } = yield* applyPlannedChanges(
      timeEntriesPort,
      plan,
      input.dryRun,
      fetched.quota,
    );

    const output: ModifyEntriesOutput = {
      status: status,
      since: since,
      until: until,
      stats: {
        fetchedCount: fetched.fetchedCount,
        excludedCount: fetched.excludedCount,
        processedCount: sortedEntries.length,
        modifiedCount: plan.modifications.length,
        deletedCount: plan.deletions.length,
      },
      modifications: plan.modifications,
      deletedIds: plan.deletions,
      quota: quota,
    };

    yield* notificationPort
      .notifyCompleted({
        status: output.status,
        since: output.since,
        until: output.until,
        fetchedCount: output.stats.fetchedCount,
        excludedCount: output.stats.excludedCount,
        modifications: output.modifications,
        deletedIds: output.deletedIds,
        quota: output.quota,
      })
      .pipe(Effect.catchAll(() => Effect.void));

    return output;
  }).pipe(Effect.tapError(notifyFailure));
