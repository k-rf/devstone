import { Option } from "effect";

import { type TimeEntry } from "./time-entry.js";

const numberOptionEquivalence = Option.getEquivalence<number>((a, b) => a === b);

const hasSameTagIds = (first: readonly number[], second: readonly number[]): boolean =>
  first.length === second.length && first.every((tagId, index) => tagId === second[index]);

/**
 * 2 つのタイムエントリーがマージ可能な同一内容かを判定する。
 * `id`・時間区間・スケジュール連携有無は比較対象外とする。
 * @param first - 1 つ目のタイムエントリー
 * @param second - 2 つ目のタイムエントリー
 * @returns 種別・タスク・プロジェクト・クライアント・説明・タグ・課金フラグがすべて一致するとき `true`
 */
export const isSameEntry = (first: TimeEntry, second: TimeEntry): boolean =>
  first.type === second.type &&
  numberOptionEquivalence(first.taskId, second.taskId) &&
  numberOptionEquivalence(first.projectId, second.projectId) &&
  numberOptionEquivalence(first.clientId, second.clientId) &&
  first.description === second.description &&
  hasSameTagIds(first.tagIds, second.tagIds) &&
  first.billable === second.billable;
