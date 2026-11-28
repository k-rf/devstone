import { getIntervalDurationSeconds } from "@devstone/libs-time-interval";
import { DateTime, Match, Option } from "effect";

import { type EnvValidationError } from "../../../config/load-env.js";
import { type ModifyEntriesWorkflowError } from "../../../core/application/modify-entries.workflow.js";
import { type TimeEntry } from "../../../core/domain/time-entry.js";
import { type NotificationError } from "../../../core/port/outbound/notification/notification.port.js";
import { formatIsoMillis } from "../../../utils/format-iso-millis.js";

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

/**
 * ワークフロー・環境変数・通知エラーを標準エラー出力向けの構造化 JSON 文字列へ整形する
 * @param error - 発生したエラー
 * @returns JSON 文字列
 */
export const formatErrorJson = (
  error: ModifyEntriesWorkflowError | EnvValidationError | NotificationError,
): string =>
  Match.value(error).pipe(
    Match.tag("ModifyEntriesAbortedError", (aborted) =>
      JSON.stringify({
        status: "aborted",
        reason: aborted.reason,
        message: aborted.message,
        stats: aborted.stats,
        first: serializeTimeEntry(aborted.first),
        second: serializeTimeEntry(aborted.second),
        quota: {
          remaining: Option.getOrUndefined(aborted.quota.remaining),
          resetsInSeconds: Option.getOrUndefined(aborted.quota.resetsInSeconds),
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
    Match.tag("NotificationError", (notificationError) =>
      JSON.stringify({
        status: "warning",
        error: notificationError._tag,
        message: notificationError.message,
      }),
    ),
    Match.exhaustive,
  );
