import { mergeIntervalBounds } from "@devstone/libs-time-interval";

import { isSameEntry } from "./is-same-entry.js";
import { type EntryModification } from "./revision-plan.js";
import { type TimeEntry } from "./time-entry.js";
import { upsertModification } from "./upsert-modification.js";

/**
 * 同一エントリーマージ処理の結果
 */
export interface MergeSameEntriesResult {
  readonly entries: readonly TimeEntry[];
  readonly modifications: readonly EntryModification[];
  readonly deletions: readonly number[];
}

const mergeAdjacentPair = (
  acc: MergeSameEntriesResult,
  prev: TimeEntry,
  next: TimeEntry,
): MergeSameEntriesResult => {
  if (!isSameEntry(prev, next) || (prev.hasScheduleBinding && next.hasScheduleBinding)) {
    return {
      entries: [...acc.entries, next],
      modifications: acc.modifications,
      deletions: acc.deletions,
    };
  }

  const keepSecond = !prev.hasScheduleBinding && next.hasScheduleBinding;
  const survivor = keepSecond ? next : prev;
  const victim = keepSecond ? prev : next;
  const mergedInterval = mergeIntervalBounds(prev.interval, next.interval);
  const updatedSurvivor: TimeEntry = { ...survivor, interval: mergedInterval };

  // 連鎖マージで先に変更登録されていたエントリーが後から削除対象になった場合、
  // PATCH と DELETE に同一 ID が混在しないよう modifications から除去する。
  const modificationsWithoutVictim = acc.modifications.filter(
    (modification) => modification.id !== victim.id,
  );
  const nextModifications = upsertModification(
    modificationsWithoutVictim,
    survivor.id,
    survivor.interval,
    mergedInterval,
  );

  return {
    entries: [...acc.entries.slice(0, -1), updatedSurvivor],
    modifications: nextModifications,
    deletions: [...acc.deletions, victim.id],
  };
};

/**
 * ソート済みタイムエントリー列から隣接する同一エントリーをマージする。
 * 予定ブロック・カレンダー連携があるエントリーを優先保持し、連鎖マージ時の PATCH/DELETE 衝突を防ぐ。
 * @param entries - `(start ASC, end ASC, id ASC)` でソート済みのタイムエントリー配列
 * @returns マージ後の残存エントリー配列、区間変更リスト、削除対象 ID リスト
 */
export const mergeSameEntries = (entries: readonly TimeEntry[]): MergeSameEntriesResult =>
  entries.reduce<MergeSameEntriesResult>(
    (acc, next) => {
      const prev = acc.entries.at(-1);

      if (prev === undefined) {
        return {
          entries: [next],
          modifications: acc.modifications,
          deletions: acc.deletions,
        };
      }

      return mergeAdjacentPair(acc, prev, next);
    },
    { entries: [], modifications: [], deletions: [] },
  );
