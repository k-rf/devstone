import { Data, type DateTime, type Option } from "effect";

import { type AbortReason } from "./revision-plan.js";
import { type TimeEntry } from "./time-entry.js";

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
  readonly fetchedCount: number;
  readonly excludedCount: number;
  readonly processedCount: number;
  readonly quotaRemaining: Option.Option<number>;
  readonly quotaResetsInSeconds: Option.Option<number>;
}> {}
