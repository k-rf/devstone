import { TimeInstant } from "./time-instant.js";
import { TimeInterval } from "./time-interval.js";

/**
 * 2 つの時間区間の最小開始時刻と最大終了時刻からなる外接区間 `[min(start), max(end)]` を返す
 * @param first - 1 つ目の時間区間
 * @param second - 2 つ目の時間区間
 * @returns 両区間を包含する最小の `TimeInterval`
 */
export const mergeIntervalBounds = (first: TimeInterval, second: TimeInterval): TimeInterval => {
  const start = TimeInstant.make(Math.min(first.start, second.start));
  const end = TimeInstant.make(Math.max(first.end, second.end));

  return TimeInterval.make({ start: start, end: end });
};
