import {
  TimeInterval,
  compareIntervals,
  type IntervalRelation,
} from "@devstone/libs-time-interval";
import { Match, Option } from "effect";

import { isSameEntry } from "./is-same-entry.js";
import { mergeSameEntries } from "./merge-same-entries.js";
import { type AbortReason, type EntryModification, type RevisionPlan } from "./revision-plan.js";
import { type TimeEntryId } from "./time-entry-id.js";
import { type TimeEntry } from "./time-entry.js";
import { upsertModification } from "./upsert-modification.js";

type RevisionAborted = Extract<RevisionPlan, { readonly _tag: "Aborted" }>;

interface PreMergeState {
  readonly prev: TimeEntry;
  readonly aborted: Option.Option<RevisionAborted>;
}

interface RevisionState {
  readonly prev: TimeEntry;
  readonly plan: RevisionPlan;
}

const getAbortReason = (relation: IntervalRelation): Option.Option<AbortReason> =>
  Match.value(relation).pipe(
    Match.whenOr("Equivalent", "GreaterOuter", "LessInner", () =>
      Option.some("NotDetermine" as const),
    ),
    Match.whenOr("Greater", "GreaterOverlap", "GreaterInner", () =>
      Option.some("InvalidOrder" as const),
    ),
    Match.whenOr("Less", "LessOverlap", "LessOuter", () => Option.none()),
    Match.exhaustive,
  );

// 同一開始時刻の異内容競合や順序異常をマージ前に検出し、ID 順で判定が揺れないよう All-or-Nothing で停止する。
const detectPreMergeAbort = (entries: readonly TimeEntry[]): Option.Option<RevisionAborted> => {
  const state = entries.reduce<PreMergeState | undefined>((acc, next) => {
    if (acc === undefined) {
      return { prev: next, aborted: Option.none() };
    }

    if (Option.isSome(acc.aborted)) {
      return acc;
    }

    const reason = getAbortReason(compareIntervals(acc.prev.interval, next.interval));
    const aborted = reason.pipe(
      Option.filter(
        (abortReason) => abortReason === "InvalidOrder" || !isSameEntry(acc.prev, next),
      ),
      Option.map(
        (abortReason): RevisionAborted => ({
          _tag: "Aborted",
          reason: abortReason,
          first: acc.prev,
          second: next,
        }),
      ),
    );

    return { prev: next, aborted: aborted };
  }, undefined);

  return state === undefined ? Option.none() : state.aborted;
};

const adjustFirstEndToSecondStart = (
  first: TimeEntry,
  second: TimeEntry,
  modifications: readonly EntryModification[],
  deletions: readonly TimeEntryId[],
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
  deletions: readonly TimeEntryId[],
): RevisionState => {
  const relation = compareIntervals(prev.interval, second.interval);

  return Option.match(getAbortReason(relation), {
    onSome: (reason) => ({
      prev: second,
      plan: {
        _tag: "Aborted" as const,
        reason: reason,
        first: prev,
        second: second,
      },
    }),
    onNone: () =>
      relation === "Less" && prev.interval.end === second.interval.start
        ? {
            prev: second,
            plan: {
              _tag: "Planned" as const,
              modifications: modifications,
              deletions: deletions,
            },
          }
        : adjustFirstEndToSecondStart(prev, second, modifications, deletions),
  });
};

/**
 * ソート済みタイムエントリー列に対し、同一エントリーマージ・隙間補完・重複切り詰めを
 * メモリ上で計画する純粋関数（All-or-Nothing）。
 * マージ前に順序異常および同一開始時刻の異内容競合を検査し、判定不能重複または順序異常を検出した場合は即座に `Aborted` を返す。
 * @param entries - `(start ASC, end ASC, id ASC)` でソート済みのタイムエントリー配列
 * @returns 更新・削除計画（`Planned`）または中止結果（`Aborted`）
 */
export const reviseEntries = (entries: readonly TimeEntry[]): RevisionPlan => {
  const preAbort = detectPreMergeAbort(entries);

  if (Option.isSome(preAbort)) {
    return preAbort.value;
  }

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
