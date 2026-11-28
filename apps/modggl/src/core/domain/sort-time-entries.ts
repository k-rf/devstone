import { type TimeEntry } from "./time-entry.js";

const compareTimeEntries = (first: TimeEntry, second: TimeEntry): number => {
  if (first.interval.start !== second.interval.start) {
    return first.interval.start - second.interval.start;
  }

  if (first.interval.end !== second.interval.end) {
    return first.interval.end - second.interval.end;
  }

  return first.id - second.id;
};

/**
 * タイムエントリー配列を `(start ASC, end ASC, id ASC)` の順序で不変かつ決定論的にソートする
 * @param entries - ソート対象のタイムエントリー配列
 * @returns ソート済みの新しいタイムエントリー配列
 */
export const sortTimeEntries = (entries: readonly TimeEntry[]): readonly TimeEntry[] =>
  entries.toSorted(compareTimeEntries);
