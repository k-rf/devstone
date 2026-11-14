import { Effect } from "effect";

import { type SessionStats, type UsageCountItem } from "../domain/session-stats.js";

const formatItems = (items: readonly UsageCountItem[]): string =>
  items.length === 0
    ? "none"
    : items.map((item) => `${item.name}(${String(item.count)})`).join(", ");

/**
 * セッション統計を statusLine 表示用の1行文字列に整形する Activity。
 * @param stats - 集計済みのセッション統計
 * @returns statusLine 用の1行サマリ文字列を示す Effect
 */
export const formatStatusLineActivity = (stats: SessionStats): Effect.Effect<string> =>
  Effect.sync(() => `Skills: ${formatItems(stats.skills)} | Tools: ${formatItems(stats.tools)}`);
