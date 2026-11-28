import { Data, type DateTime } from "effect";

import { type AbortReason, type EntryModification } from "../domain/revision-plan.js";
import { type TimeEntryId } from "../domain/time-entry-id.js";
import { type TimeEntry } from "../domain/time-entry.js";
import { type ModifyEntriesStatus } from "../port/outbound/notification/notification.port.js";
import { type QuotaInfo } from "../port/outbound/toggl/time-entries.port.js";

/**
 * タイムエントリー取得段階の実行統計
 */
interface ModifyEntriesFetchedStats {
  readonly fetchedCount: number;
  readonly excludedCount: number;
  readonly processedCount: number;
}

/**
 * タイムエントリー補正処理の実行統計
 */
interface ModifyEntriesStats extends ModifyEntriesFetchedStats {
  readonly modifiedCount: number;
  readonly deletedCount: number;
}

/**
 * タイムエントリー補正ユースケースの出力データ
 */
export interface ModifyEntriesOutput {
  readonly status: ModifyEntriesStatus;
  readonly since: DateTime.Utc;
  readonly until: DateTime.Utc;
  readonly stats: ModifyEntriesStats;
  readonly modifications: readonly EntryModification[];
  readonly deletedIds: readonly TimeEntryId[];
  readonly quota: QuotaInfo;
}

/**
 * 取得期間の指定が不正（`since >= until`）な場合に発生するエラー
 */
export class InvalidDateRangeError extends Data.TaggedError("InvalidDateRangeError")<{
  readonly message: string;
  readonly since: DateTime.Utc;
  readonly until: DateTime.Utc;
}> {}

/**
 * 判定不能重複または順序異常により補正処理が全停止した際に発生するエラー
 */
export class ModifyEntriesAbortedError extends Data.TaggedError("ModifyEntriesAbortedError")<{
  readonly message: string;
  readonly reason: AbortReason;
  readonly first: TimeEntry;
  readonly second: TimeEntry;
  readonly stats: ModifyEntriesFetchedStats;
  readonly quota: QuotaInfo;
}> {}
