import { Array, Effect, Order } from "effect";

import {
  type SessionStats,
  type ToolCallEntry,
  type UsageCountItem,
} from "../domain/session-stats.js";

const SKILL_PATH_PATTERN = /(?:^|\/)skills\/([^/]+)\/SKILL\.md$/u;

const usageCountOrder: Order.Order<UsageCountItem> = Order.combine(
  Order.reverse(Order.mapInput(Order.number, (item: UsageCountItem) => item.count)),
  Order.mapInput(Order.string, (item: UsageCountItem) => item.name),
);

const extractSkillName = (entry: ToolCallEntry): readonly string[] => {
  const isFileReadTool = entry.toolName === "read_file" || entry.toolName === "view_file";
  if (!isFileReadTool || entry.targetPath === undefined) return [];

  const matched = SKILL_PATH_PATTERN.exec(entry.targetPath);
  return matched?.[1] === undefined ? [] : [matched[1]];
};

const countAndSort = (names: readonly string[]): readonly UsageCountItem[] => {
  const grouped = Array.groupBy(names, (name) => name);
  const items = Object.entries(grouped).map(([name, occurrences]) => ({
    name: name,
    count: occurrences.length,
  }));
  return Array.sort(items, usageCountOrder);
};

/**
 * ツール呼び出し履歴からスキル発動回数とツール使用回数を集計する Activity。
 * @param toolCalls - トランスクリプトから抽出されたツール呼び出し一覧
 * @returns 集計・ソート済みのセッション統計を示す Effect
 */
export const aggregateSessionStatsActivity = (
  toolCalls: readonly ToolCallEntry[],
): Effect.Effect<SessionStats> =>
  Effect.sync(() => {
    const skillNames = toolCalls.flatMap((entry) => extractSkillName(entry));
    const toolNames = toolCalls.map((entry) => entry.toolName);

    return {
      skills: countAndSort(skillNames),
      tools: countAndSort(toolNames),
    };
  });
