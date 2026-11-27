import { TimeInstant, TimeInterval } from "@devstone/libs-time-interval";
import { expect, it } from "vitest";

import { upsertModification } from "./upsert-modification.js";

const interval = (startSec: number, endSec: number): TimeInterval =>
  TimeInterval.make({
    start: TimeInstant.make(startSec * 1000),
    end: TimeInstant.make(endSec * 1000),
  });

it("未登録のエントリー ID に対して新しい変更計画を追加すること", () => {
  const prev = interval(100, 200);
  const next = interval(100, 300);

  const result = upsertModification([], 1, prev, next);

  expect(result).toStrictEqual([{ id: 1, previousInterval: prev, interval: next }]);
});

it("登録済みのエントリー ID を更新するとき元の previousInterval を維持すること", () => {
  const original = interval(100, 200);
  const merged = interval(100, 400);
  const truncated = interval(100, 350);

  const firstUpdate = upsertModification(
    [{ id: 9, previousInterval: interval(50, 90), interval: interval(50, 95) }],
    1,
    original,
    merged,
  );
  const secondUpdate = upsertModification(firstUpdate, 1, merged, truncated);

  expect(secondUpdate).toStrictEqual([
    { id: 9, previousInterval: interval(50, 90), interval: interval(50, 95) },
    { id: 1, previousInterval: original, interval: truncated },
  ]);
});

it("最終区間が元の previousInterval と完全に一致した場合は変更計画から除去すること", () => {
  const original = interval(100, 200);
  const merged = interval(100, 300);

  const firstUpdate = upsertModification([], 1, original, merged);
  const reverted = upsertModification(firstUpdate, 1, merged, original);

  expect(reverted).toStrictEqual([]);
});

it("start のみ元と同じで end が異なる場合は変更計画を保持すること", () => {
  const original = interval(100, 200);
  const next = interval(100, 250);

  const result = upsertModification([], 1, original, next);

  expect(result).toStrictEqual([{ id: 1, previousInterval: original, interval: next }]);
});

it("start が異なり end が同じ場合は変更計画を保持すること", () => {
  const original = interval(100, 200);
  const next = interval(50, 200);

  const result = upsertModification([], 1, original, next);

  expect(result).toStrictEqual([{ id: 1, previousInterval: original, interval: next }]);
});
