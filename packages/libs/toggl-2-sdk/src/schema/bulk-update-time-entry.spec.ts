import { Option, Schema } from "effect";
import { expect, it } from "vitest";

import { BulkUpdateTimeEntryItem } from "./bulk-update-time-entry.js";

it("start と duration の両方が Option.some のとき両フィールドを含む JSON にエンコードされること", () => {
  const encoded = Schema.encodeSync(BulkUpdateTimeEntryItem)({
    id: 101,
    start: Option.some("2026-11-27T09:00:00+09:00"),
    duration: Option.some(1800),
  });

  expect(encoded).toStrictEqual({
    id: 101,
    start: "2026-11-27T09:00:00+09:00",
    duration: 1800,
  });
});

it("Option.none のフィールドはエンコード結果のオブジェクトから省略されること", () => {
  const onlyDuration = Schema.encodeSync(BulkUpdateTimeEntryItem)({
    id: 102,
    start: Option.none(),
    duration: Option.some(900),
  });
  const onlyStart = Schema.encodeSync(BulkUpdateTimeEntryItem)({
    id: 103,
    start: Option.some("2026-11-27T10:00:00+09:00"),
    duration: Option.none(),
  });

  expect(onlyDuration).toStrictEqual({ id: 102, duration: 900 });
  expect("start" in onlyDuration).toBe(false);

  expect(onlyStart).toStrictEqual({ id: 103, start: "2026-11-27T10:00:00+09:00" });
  expect("duration" in onlyStart).toBe(false);
});

it("id が数値でない不正な入力は Schema.decodeUnknownSync で失敗すること", () => {
  expect(() => Schema.decodeUnknownSync(BulkUpdateTimeEntryItem)({ id: "invalid" })).toThrow();
});
