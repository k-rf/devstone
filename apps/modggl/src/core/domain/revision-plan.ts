import { type TimeInterval } from "@devstone/libs-time-interval";

import { type TimeEntryId } from "./time-entry-id.js";
import { type TimeEntry } from "./time-entry.js";

/**
 * 時間補正処理が全停止した理由
 */
export type AbortReason = "NotDetermine" | "InvalidOrder";

/**
 * 更新対象となるタイムエントリーの変更内容
 */
export interface EntryModification {
  readonly id: TimeEntryId;
  readonly previousInterval: TimeInterval;
  readonly interval: TimeInterval;
}

/**
 * 正常に算出された時間補正計画
 */
export interface RevisionPlanned {
  readonly _tag: "Planned";
  readonly modifications: readonly EntryModification[];
  readonly deletions: readonly TimeEntryId[];
}

/**
 * 判定不能重複または順序異常により全停止した補正結果
 */
interface RevisionAborted {
  readonly _tag: "Aborted";
  readonly reason: AbortReason;
  readonly first: TimeEntry;
  readonly second: TimeEntry;
}

/**
 * タイムエントリー時間補正の結果計画（All-or-Nothing）
 */
export type RevisionPlan = RevisionPlanned | RevisionAborted;
