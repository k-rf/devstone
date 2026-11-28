import { Option } from "effect";

import { type TagId } from "./tag-id.js";
import { type TimeEntry } from "./time-entry.js";

const optionEquivalence = <A>() => Option.getEquivalence<A>((a, b) => a === b);

const hasSameTagIds = (first: readonly TagId[], second: readonly TagId[]): boolean => {
  const firstSet = new Set(first);
  const secondSet = new Set(second);

  return firstSet.size === secondSet.size && [...firstSet].every((tagId) => secondSet.has(tagId));
};

/**
 * 2 つのタイムエントリーがマージ可能な同一内容かを判定する。
 * `id`・時間区間・スケジュール連携有無は比較対象外とし、タグ ID の順序や重複は問わない。
 * @param first - 1 つ目のタイムエントリー
 * @param second - 2 つ目のタイムエントリー
 * @returns 種別・タスク・プロジェクト・クライアント・説明・タグ集合・課金フラグがすべて一致するとき `true`
 */
export const isSameEntry = (first: TimeEntry, second: TimeEntry): boolean =>
  first.type === second.type &&
  optionEquivalence()(first.taskId, second.taskId) &&
  optionEquivalence()(first.projectId, second.projectId) &&
  optionEquivalence()(first.clientId, second.clientId) &&
  first.description === second.description &&
  hasSameTagIds(first.tagIds, second.tagIds) &&
  first.billable === second.billable;
