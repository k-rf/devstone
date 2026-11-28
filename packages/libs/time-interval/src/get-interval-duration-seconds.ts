import { type TimeInterval } from "./time-interval.js";

const MILLISECONDS_PER_SECOND = 1000;

/**
 * 時間区間の長さ（秒）を整数で返す。1 秒未満の端数は切り捨てる
 * @param interval - 長さを求める時間区間
 * @returns 区間長（秒単位の非負整数）
 */
export const getIntervalDurationSeconds = (interval: TimeInterval): number =>
  Math.floor((interval.end - interval.start) / MILLISECONDS_PER_SECOND);
