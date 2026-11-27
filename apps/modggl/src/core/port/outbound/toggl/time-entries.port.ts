import { Context, Data, type DateTime, type Effect, type Option } from "effect";

import { type EntryModification } from "../../../domain/revision-plan.js";
import { type TimeEntry } from "../../../domain/time-entry.js";

/**
 * Toggl 2.0 API のクォータ情報
 */
export interface QuotaInfo {
  readonly remaining: Option.Option<number>;
  readonly resetsInSeconds: Option.Option<number>;
}

/**
 * タイムエントリー取得結果
 */
export interface ListEntriesResult {
  readonly entries: readonly TimeEntry[];
  readonly fetchedCount: number;
  readonly excludedCount: number;
  readonly quota: QuotaInfo;
}

/**
 * タイムエントリー取得範囲パラメータ
 */
export interface ListEntriesParams {
  readonly since: DateTime.Utc;
  readonly until: DateTime.Utc;
}

/**
 * タイムエントリー操作エラーの分類
 */
export type TimeEntriesErrorReason = "Unauthorized" | "QuotaExceeded" | "Conflict" | "ApiError";

/**
 * タイムエントリー外部操作で発生する型付きエラー
 */
export class TimeEntriesError extends Data.TaggedError("TimeEntriesError")<{
  readonly message: string;
  readonly reason: TimeEntriesErrorReason;
  readonly status: Option.Option<number>;
  readonly resetsInSeconds: Option.Option<number>;
  readonly cause: Option.Option<unknown>;
}> {}

/**
 * Toggl 2.0 タイムエントリーの取得・一括更新・一括削除を担う Outbound Port
 */
export class TimeEntriesPort extends Context.Tag("TimeEntriesPort")<
  TimeEntriesPort,
  {
    readonly listEntries: (
      params: ListEntriesParams,
    ) => Effect.Effect<ListEntriesResult, TimeEntriesError>;
    readonly updateEntries: (
      modifications: readonly EntryModification[],
    ) => Effect.Effect<Option.Option<QuotaInfo>, TimeEntriesError>;
    readonly deleteEntries: (
      ids: readonly number[],
    ) => Effect.Effect<Option.Option<QuotaInfo>, TimeEntriesError>;
  }
>() {}
