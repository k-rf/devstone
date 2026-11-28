import { TimeInterval } from "@devstone/libs-time-interval";
import {
  type Toggl2TimeEntryProject,
  type Toggl2TimeEntryStreamItem,
} from "@devstone/libs-toggl-2-sdk";
import { Option, Schema } from "effect";

import { sortTimeEntries } from "../../../core/domain/sort-time-entries.js";
import { TimeEntry } from "../../../core/domain/time-entry.js";

const MILLISECONDS_PER_SECOND = 1000;

/**
 * Toggl 2.0 ストリーム API 応答のフィルタリング・正規化・ソート結果
 */
export interface MappedTimeEntries {
  readonly entries: readonly TimeEntry[];
  readonly fetchedCount: number;
  readonly excludedCount: number;
}

const isEligibleStreamItem = (item: Toggl2TimeEntryStreamItem): boolean =>
  Option.isSome(item.start) &&
  Option.isSome(item.duration) &&
  Option.isNone(item.deletedAt) &&
  Option.isNone(item.archivedAt) &&
  !item.draft &&
  !item.patternManaged &&
  Option.isNone(item.lockReason);

// Toggl 2.0 PATCH API は秒単位の duration のみを受け付けるため、開始時刻・区間長ともに秒粒度へ揃えて冪等性を保つ。
const parseValidInterval = (
  startString: string,
  durationSeconds: number,
): Option.Option<TimeInterval> => {
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
    return Option.none();
  }

  const rawStartMs = Date.parse(startString);

  if (!Number.isFinite(rawStartMs)) {
    return Option.none();
  }

  const startMs = Math.floor(rawStartMs / MILLISECONDS_PER_SECOND) * MILLISECONDS_PER_SECOND;
  const endMs = startMs + Math.floor(durationSeconds) * MILLISECONDS_PER_SECOND;

  return Schema.decodeUnknownOption(TimeInterval)({
    start: startMs,
    end: endMs,
  });
};

const getProjectClientId = (
  project: Option.Option<Toggl2TimeEntryProject>,
): Option.Option<number> =>
  project.pipe(
    Option.flatMap((value) => value.client),
    Option.map((client) => client.id),
  );

const resolveTaskId = (item: Toggl2TimeEntryStreamItem): Option.Option<number> =>
  item.taskId.pipe(Option.orElse(() => item.task.pipe(Option.map((task) => task.id))));

const resolveProjectId = (item: Toggl2TimeEntryStreamItem): Option.Option<number> =>
  item.projectId.pipe(
    Option.orElse(() => item.project.pipe(Option.map((project) => project.id))),
    Option.orElse(() => item.task.pipe(Option.flatMap((task) => task.projectId))),
    Option.orElse(() =>
      item.task.pipe(
        Option.flatMap((task) => task.project),
        Option.map((project) => project.id),
      ),
    ),
  );

const resolveClientId = (item: Toggl2TimeEntryStreamItem): Option.Option<number> =>
  getProjectClientId(item.project).pipe(
    Option.orElse(() => item.task.pipe(Option.flatMap((task) => getProjectClientId(task.project)))),
    Option.orElse(() =>
      item.task.pipe(
        Option.flatMap((task) => task.client),
        Option.map((client) => client.id),
      ),
    ),
  );

const mapSingleStreamItem = (item: Toggl2TimeEntryStreamItem): Option.Option<TimeEntry> => {
  if (!isEligibleStreamItem(item)) {
    return Option.none();
  }

  return Option.all([item.start, item.duration]).pipe(
    Option.flatMap(([startString, durationSec]) => parseValidInterval(startString, durationSec)),
    Option.flatMap((interval) =>
      Schema.decodeUnknownOption(TimeEntry)({
        id: item.id,
        interval: interval,
        type: item.type,
        taskId: resolveTaskId(item),
        projectId: resolveProjectId(item),
        clientId: resolveClientId(item),
        description: Option.getOrElse(item.description, () => ""),
        tagIds: [...new Set(item.tags.map((tag) => tag.id))].toSorted((a, b) => a - b),
        billable: Option.getOrElse(item.billable, () => false),
        hasScheduleBinding:
          Option.isSome(item.plannedStart) ||
          Option.isSome(item.plannedDuration) ||
          Option.isSome(item.calendarEventId),
      }),
    ),
  );
};

/**
 * Toggl 2.0 ストリーム API の項目配列をフィルタリング・正規化・決定論的ソートしてドメインモデル配列へ変換する
 * @param items - Toggl 2.0 SDK が返却した生エントリー一覧
 * @returns 補正対象となるソート済み `TimeEntry` 配列と取得・除外件数統計
 */
export const mapStreamItemsToTimeEntries = (
  items: readonly Toggl2TimeEntryStreamItem[],
): MappedTimeEntries => {
  const entries = sortTimeEntries(
    items.flatMap((item) => Option.toArray(mapSingleStreamItem(item))),
  );

  return {
    entries: entries,
    fetchedCount: items.length,
    excludedCount: items.length - entries.length,
  };
};
