import { TimeInterval, compareIntervals } from "@devstone/libs-time-interval";
import { Match } from "effect";

import { mergeSameEntries } from "./merge-same-entries.js";
import { type EntryModification, type RevisionPlan } from "./revision-plan.js";
import { type TimeEntry } from "./time-entry.js";
import { upsertModification } from "./upsert-modification.js";

interface RevisionState {
  readonly prev: TimeEntry;
  readonly plan: RevisionPlan;
}

const adjustFirstEndToSecondStart = (
  first: TimeEntry,
  second: TimeEntry,
  modifications: readonly EntryModification[],
  deletions: readonly number[],
): RevisionState => {
  const nextInterval = TimeInterval.make({
    start: first.interval.start,
    end: second.interval.start,
  });

  return {
    prev: second,
    plan: {
      _tag: "Planned",
      modifications: upsertModification(modifications, first.id, first.interval, nextInterval),
      deletions: deletions,
    },
  };
};

const evaluateAdjacentPair = (
  prev: TimeEntry,
  second: TimeEntry,
  modifications: readonly EntryModification[],
  deletions: readonly number[],
): RevisionState =>
  Match.value(compareIntervals(prev.interval, second.interval)).pipe(
    Match.when("Less", () =>
      prev.interval.end === second.interval.start
        ? {
            prev: second,
            plan: {
              _tag: "Planned" as const,
              modifications: modifications,
              deletions: deletions,
            },
          }
        : adjustFirstEndToSecondStart(prev, second, modifications, deletions),
    ),
    Match.whenOr("LessOverlap", "LessOuter", () =>
      adjustFirstEndToSecondStart(prev, second, modifications, deletions),
    ),
    Match.whenOr("Equivalent", "GreaterOuter", "LessInner", () => ({
      prev: second,
      plan: {
        _tag: "Aborted" as const,
        reason: "NotDetermine" as const,
        first: prev,
        second: second,
      },
    })),
    Match.whenOr("Greater", "GreaterOverlap", "GreaterInner", () => ({
      prev: second,
      plan: {
        _tag: "Aborted" as const,
        reason: "InvalidOrder" as const,
        first: prev,
        second: second,
      },
    })),
    Match.exhaustive,
  );

/**
 * ソート済みタイムエントリー列に対し、同一エントリーマージ・隙間補完・重複切り詰めを
 * メモリ上で計画する純粋関数（All-or-Nothing）。
 * 判定不能重複または順序異常を検出した場合は即座に `Aborted` を返す。
 * @param entries - `(start ASC, end ASC, id ASC)` でソート済みのタイムエントリー配列
 * @returns 更新・削除計画（`Planned`）または中止結果（`Aborted`）
 */
export const reviseEntries = (entries: readonly TimeEntry[]): RevisionPlan => {
  const merged = mergeSameEntries(entries);
  const [first, ...rest] = merged.entries;

  if (first === undefined) {
    return {
      _tag: "Planned",
      modifications: merged.modifications,
      deletions: merged.deletions,
    };
  }

  return rest.reduce<RevisionState>(
    (state, second) => {
      if (state.plan._tag === "Aborted") return state;

      return evaluateAdjacentPair(
        state.prev,
        second,
        state.plan.modifications,
        state.plan.deletions,
      );
    },
    {
      prev: first,
      plan: {
        _tag: "Planned",
        modifications: merged.modifications,
        deletions: merged.deletions,
      },
    },
  ).plan;
};
