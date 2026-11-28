import { Match, Number as EffectNumber } from "effect";

import { type IntervalRelation } from "./interval-relation.js";
import { type TimeInterval } from "./time-interval.js";

/**
 * 2 つの時間区間の位置関係を 9 パターンの `IntervalRelation` として判定する。
 *
 * 半開区間 `[start, end)` の考え方に従い、完全一致（`Equivalent`）を除いて
 * `first.end <= second.start` のときは `Less`、`second.end <= first.start` のときは `Greater` を返す。
 * @param first - 比較元となる 1 つ目の時間区間
 * @param second - 比較対象となる 2 つ目の時間区間
 * @returns `first` と `second` の時間的位置関係
 */
export const compareIntervals = (first: TimeInterval, second: TimeInterval): IntervalRelation => {
  if (first.start === second.start && first.end === second.end) {
    return "Equivalent";
  }

  if (first.end <= second.start) {
    return "Less";
  }

  if (second.end <= first.start) {
    return "Greater";
  }

  return Match.value(EffectNumber.Order(first.start, second.start)).pipe(
    Match.when(-1, (): IntervalRelation => (first.end < second.end ? "LessOverlap" : "LessOuter")),
    Match.when(0, (): IntervalRelation => (first.end < second.end ? "LessInner" : "GreaterOuter")),
    Match.when(
      1,
      (): IntervalRelation => (first.end > second.end ? "GreaterOverlap" : "GreaterInner"),
    ),
    Match.exhaustive,
  );
};
