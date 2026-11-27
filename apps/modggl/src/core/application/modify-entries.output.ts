import { type DateTime } from "effect";

import { type EntryModification } from "../domain/revision-plan.js";
import { type QuotaInfo } from "../port/outbound/toggl/time-entries.port.js";

/**
 * タイムエントリー補正処理の実行統計
 */
interface ModifyEntriesStats {
  readonly fetchedCount: number;
  readonly excludedCount: number;
  readonly processedCount: number;
  readonly modifiedCount: number;
  readonly deletedCount: number;
}

/**
 * タイムエントリー補正ユースケースの正常終了ステータス
 */
export type ModifyEntriesStatus = "completed" | "no_changes" | "dry_run";

/**
 * タイムエントリー補正ユースケースの出力データ
 */
export interface ModifyEntriesOutput {
  readonly status: ModifyEntriesStatus;
  readonly since: DateTime.Utc;
  readonly until: DateTime.Utc;
  readonly stats: ModifyEntriesStats;
  readonly modifications: readonly EntryModification[];
  readonly deletedIds: readonly number[];
  readonly quota: QuotaInfo;
}
