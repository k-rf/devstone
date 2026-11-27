import { Schema } from "effect";

import { TimeInstant } from "./time-instant.js";

/**
 * 開始時刻と終了時刻（`start <= end`）を表す不変な時間区間スキーマ
 */
export const TimeInterval = Schema.Struct({
  start: TimeInstant,
  end: TimeInstant,
}).pipe(
  Schema.filter((interval) =>
    interval.start <= interval.end ? true : "開始時刻は終了時刻以下である必要があります",
  ),
  Schema.brand("TimeInterval", {
    identifier: "TimeInterval",
    description: "開始時刻が終了時刻以下である不変な時間区間",
  }),
);

/**
 * 開始時刻と終了時刻（`start <= end`）を表す不変な時間区間型
 */
export type TimeInterval = typeof TimeInterval.Type;
