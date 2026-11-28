import { getIntervalDurationSeconds } from "@devstone/libs-time-interval";
import {
  Toggl2TimeEntryId,
  makeToggl2ApiClient,
  type Toggl2BulkUpdateTimeEntryItem,
  type Toggl2ClientConfig,
  type Toggl2SdkError,
} from "@devstone/libs-toggl-2-sdk";
import { DateTime, Effect, Layer, Match, Option } from "effect";

import { type EntryModification } from "../../../core/domain/revision-plan.js";
import {
  TimeEntriesError,
  TimeEntriesPort,
} from "../../../core/port/outbound/toggl/time-entries.port.js";
import { formatIsoMillis } from "../../../utils/format-iso-millis.js";

import { mapStreamItemsToTimeEntries } from "./toggl-2.mapper.js";

const mapToggl2SdkError = (error: Toggl2SdkError): TimeEntriesError =>
  Match.value(error).pipe(
    Match.tag(
      "Toggl2UnauthorizedError",
      (e) =>
        new TimeEntriesError({
          message: e.message,
          reason: "Unauthorized",
          status: Option.some(401),
          resetsInSeconds: Option.none(),
          cause: Option.some(e),
        }),
    ),
    Match.tag(
      "Toggl2QuotaExceededError",
      (e) =>
        new TimeEntriesError({
          message: e.message,
          reason: "QuotaExceeded",
          status: Option.some(402),
          resetsInSeconds: e.resetsInSeconds,
          cause: Option.some(e),
        }),
    ),
    Match.tag(
      "Toggl2ConflictError",
      (e) =>
        new TimeEntriesError({
          message: e.message,
          reason: "Conflict",
          status: Option.some(409),
          resetsInSeconds: Option.none(),
          cause: Option.some(e),
        }),
    ),
    Match.tag(
      "Toggl2ApiError",
      (e) =>
        new TimeEntriesError({
          message: e.message,
          reason: "ApiError",
          status: e.status,
          resetsInSeconds: Option.none(),
          cause: e.cause,
        }),
    ),
    Match.exhaustive,
  );

const toBulkUpdateItem = (
  modification: EntryModification,
): Option.Option<Toggl2BulkUpdateTimeEntryItem> => {
  const startChanged = modification.interval.start !== modification.previousInterval.start;
  const prevDuration = getIntervalDurationSeconds(modification.previousInterval);
  const nextDuration = getIntervalDurationSeconds(modification.interval);
  const durationChanged = prevDuration !== nextDuration;

  if (!startChanged && !durationChanged) {
    return Option.none();
  }

  return Option.some({
    id: Toggl2TimeEntryId.make(modification.id),
    start: startChanged ? Option.some(formatIsoMillis(modification.interval.start)) : Option.none(),
    duration: durationChanged ? Option.some(nextDuration) : Option.none(),
  });
};

/**
 * Toggl 2.0 SDK を利用して `TimeEntriesPort` を実装する Layer を生成する
 * @param config - Toggl 2.0 API クライアント設定
 * @returns `TimeEntriesPort` の本番実装 Layer
 */
export const Toggl2AdapterLive = (config: Toggl2ClientConfig): Layer.Layer<TimeEntriesPort> =>
  Layer.effect(
    TimeEntriesPort,
    Effect.map(makeToggl2ApiClient(config), (client) => ({
      listEntries: ({ since, until }) =>
        client
          .listTimeEntriesStream({
            dateFrom: DateTime.formatIso(since),
            dateTo: DateTime.formatIso(until),
            includeLockReason: true,
          })
          .pipe(
            Effect.map((result) => ({
              ...mapStreamItemsToTimeEntries(result.entries),
              quota: result.quota,
            })),
            Effect.mapError(mapToggl2SdkError),
          ),
      updateEntries: (modifications) =>
        client
          .bulkUpdateTimeEntries(
            modifications.flatMap((modification) => Option.toArray(toBulkUpdateItem(modification))),
          )
          .pipe(Effect.mapError(mapToggl2SdkError)),
      deleteEntries: (ids) =>
        client
          .bulkDeleteTimeEntries(ids.map((id) => Toggl2TimeEntryId.make(id)))
          .pipe(Effect.mapError(mapToggl2SdkError)),
    })),
  );
