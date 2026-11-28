import { Option, Schema } from "effect";
import { expect, it } from "vitest";

import { Toggl2BulkUpdateTimeEntryItem } from "./bulk-update-time-entry.js";
import { Toggl2TimeEntryId } from "./time-entry-id.js";

it("start と duration の両方が Option.some のとき両フィールドを含む JSON にエンコードされること", () => {
  const encoded = Schema.encodeSync(Toggl2BulkUpdateTimeEntryItem)({
    id: Toggl2TimeEntryId.make(101),
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
  const onlyDuration = Schema.encodeSync(Toggl2BulkUpdateTimeEntryItem)({
    id: Toggl2TimeEntryId.make(102),
    start: Option.none(),
    duration: Option.some(900),
  });
  const onlyStart = Schema.encodeSync(Toggl2BulkUpdateTimeEntryItem)({
    id: Toggl2TimeEntryId.make(103),
    start: Option.some("2026-11-27T10:00:00+09:00"),
    duration: Option.none(),
  });

  expect(onlyDuration).toStrictEqual({ id: 102, duration: 900 });
  expect("start" in onlyDuration).toBe(false);

  expect(onlyStart).toStrictEqual({ id: 103, start: "2026-11-27T10:00:00+09:00" });
  expect("duration" in onlyStart).toBe(false);
});

it("start と duration が両方欠落または Option.none のときはエンコード・デコードともに失敗すること", () => {
  expect(() => Schema.decodeUnknownSync(Toggl2BulkUpdateTimeEntryItem)({ id: 104 })).toThrow();
  expect(() =>
    Schema.encodeSync(Toggl2BulkUpdateTimeEntryItem)({
      id: Toggl2TimeEntryId.make(104),
      start: Option.none(),
      duration: Option.none(),
    }),
  ).toThrow();
});

it("id が不正な入力は Schema.decodeUnknownSync で失敗すること", () => {
  expect(() =>
    Schema.decodeUnknownSync(Toggl2BulkUpdateTimeEntryItem)({ id: "invalid", duration: 60 }),
  ).toThrow();
  expect(() =>
    Schema.decodeUnknownSync(Toggl2BulkUpdateTimeEntryItem)({ id: 0, duration: 60 }),
  ).toThrow();
});
