import { type TimeInterval } from "@devstone/libs-time-interval";

import { type EntryModification } from "./revision-plan.js";
import { type TimeEntryId } from "./time-entry-id.js";

/**
 * 変更計画リストへタイムエントリーの区間変更を不変的に登録または更新する。
 * すでに変更が登録済みの場合は元の `previousInterval` を保持し、
 * 最終区間が元の区間と一致した場合は不要な更新としてリストから取り除く。
 * @param modifications - 現在の変更計画リスト
 * @param id - 対象タイムエントリー ID
 * @param previousInterval - 未登録時に基準となる元の時間区間
 * @param nextInterval - 更新後の時間区間
 * @returns 更新後の新しい変更計画リスト
 */
export const upsertModification = (
  modifications: readonly EntryModification[],
  id: TimeEntryId,
  previousInterval: TimeInterval,
  nextInterval: TimeInterval,
): readonly EntryModification[] => {
  const withoutId = modifications.filter((modification) => modification.id !== id);
  const existing = modifications.find((modification) => modification.id === id);
  const basePrevious = existing === undefined ? previousInterval : existing.previousInterval;

  if (nextInterval.start === basePrevious.start && nextInterval.end === basePrevious.end) {
    return withoutId;
  }

  return [
    ...withoutId,
    {
      id: id,
      previousInterval: basePrevious,
      interval: nextInterval,
    },
  ];
};
