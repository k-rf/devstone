import { Console, Effect, Option } from "effect";

import { ModifyEntriesAbortedError, type InvalidDateRangeError } from "../domain/errors.js";
import { reviseEntries } from "../domain/revise-entries.js";
import { type RevisionPlanned } from "../domain/revision-plan.js";
import { NotificationPort } from "../port/outbound/notification/notification.port.js";
import {
  TimeEntriesPort,
  type QuotaInfo,
  type TimeEntriesError,
} from "../port/outbound/toggl/time-entries.port.js";

import { type ModifyEntriesInput } from "./modify-entries.input.js";
import { type ModifyEntriesOutput, type ModifyEntriesStatus } from "./modify-entries.output.js";
import { resolveDateRangeActivity } from "./resolve-date-range.activity.js";

/**
 * タイムエントリー補正ユースケースで発生しうるエラーのユニオン型
 */
export type ModifyEntriesWorkflowError =
  | InvalidDateRangeError
  | ModifyEntriesAbortedError
  | TimeEntriesError;

type NotificationService = Effect.Effect.Success<typeof NotificationPort>;
type TimeEntriesService = Effect.Effect.Success<typeof TimeEntriesPort>;

const notifyApiFailure =
  (notificationPort: NotificationService, shouldNotify: boolean) => (error: TimeEntriesError) =>
    shouldNotify
      ? notificationPort
          .notifyError({
            message: error.message,
            reason: error.reason,
            status: error.status,
            resetsInSeconds: error.resetsInSeconds,
          })
          .pipe(Effect.catchAll(() => Effect.void))
      : Effect.void;

const applyPlannedChanges = (
  timeEntriesPort: TimeEntriesService,
  notificationPort: NotificationService,
  plan: RevisionPlanned,
  dryRun: boolean,
  shouldNotify: boolean,
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
      ? yield* timeEntriesPort
          .updateEntries(plan.modifications)
          .pipe(Effect.tapError(notifyApiFailure(notificationPort, shouldNotify)))
      : Option.none<QuotaInfo>();

    const deleteQuota = hasDeletions
      ? yield* timeEntriesPort
          .deleteEntries(plan.deletions)
          .pipe(Effect.tapError(notifyApiFailure(notificationPort, shouldNotify)))
      : Option.none<QuotaInfo>();

    const latestQuota = Option.orElse(deleteQuota, () => patchQuota);

    return {
      status: "completed" as const,
      quota: Option.getOrElse(latestQuota, () => initialQuota),
    };
  });

/**
 * タイムエントリーを取得し、同一エントリーのマージ・隙間補完・重複解消を All-or-Nothing で実行する Workflow
 * @param input - 取得期間・ドライラン・通知設定の入力データ
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

    const fetched = yield* timeEntriesPort
      .listEntries({ since: since, until: until })
      .pipe(Effect.tapError(notifyApiFailure(notificationPort, input.notify)));

    const plan = reviseEntries(fetched.entries);

    if (plan._tag === "Aborted") {
      if (input.notify) {
        yield* notificationPort
          .notifyAborted({
            reason: plan.reason,
            first: plan.first,
            second: plan.second,
          })
          .pipe(Effect.catchAll(() => Effect.void));
      }

      return yield* Effect.fail(
        new ModifyEntriesAbortedError({
          message: `時間重複の解決を機械決定できないため処理を停止しました (${plan.reason})`,
          reason: plan.reason,
          first: plan.first,
          second: plan.second,
          fetchedCount: fetched.fetchedCount,
          excludedCount: fetched.excludedCount,
          processedCount: fetched.entries.length,
          quotaRemaining: fetched.quota.remaining,
          quotaResetsInSeconds: fetched.quota.resetsInSeconds,
        }),
      );
    }

    const { status, quota } = yield* applyPlannedChanges(
      timeEntriesPort,
      notificationPort,
      plan,
      input.dryRun,
      input.notify,
      fetched.quota,
    );

    const output: ModifyEntriesOutput = {
      status: status,
      since: since,
      until: until,
      stats: {
        fetchedCount: fetched.fetchedCount,
        excludedCount: fetched.excludedCount,
        processedCount: fetched.entries.length,
        modifiedCount: plan.modifications.length,
        deletedCount: plan.deletions.length,
      },
      modifications: plan.modifications,
      deletedIds: plan.deletions,
      quota: quota,
    };

    if (input.notify) {
      yield* notificationPort
        .notifyCompleted({
          status: output.status,
          since: output.since,
          until: output.until,
          fetchedCount: output.stats.fetchedCount,
          excludedCount: output.stats.excludedCount,
          modifications: output.modifications,
          deletedIds: output.deletedIds,
          quotaRemaining: output.quota.remaining,
          quotaResetsInSeconds: output.quota.resetsInSeconds,
        })
        .pipe(
          Effect.tapError((error) => Console.error(`通知送信エラー: ${error.message}`)),
          Effect.catchAll(() => Effect.void),
        );
    }

    return output;
  });
