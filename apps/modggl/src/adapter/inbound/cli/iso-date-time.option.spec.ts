import { DateTime, Schema } from "effect";
import { expect, it } from "vitest";

import { IsoDateTimeSchema } from "./iso-date-time.option.js";

it.each([
  { label: "UTC Z 指定", input: "2026-11-27T09:00:00Z", expected: "2026-11-27T09:00:00.000Z" },
  {
    label: "ミリ秒とオフセット指定",
    input: "2026-11-27T09:00:00.500+09:00",
    expected: "2026-11-27T00:00:00.500Z",
  },
  { label: "うるう年 2/29", input: "2024-02-29T00:00:00Z", expected: "2024-02-29T00:00:00.000Z" },
  { label: "日付のみ", input: "2026-11-27", expected: "2026-11-27T00:00:00.000Z" },
])("有効な ISO 8601 日時（$label）を DateTime.Utc へデコードできること", ({ input, expected }) => {
  const decoded = Schema.decodeUnknownSync(IsoDateTimeSchema)(input);

  expect(DateTime.formatIso(decoded)).toBe(expected);
});

it.each([
  { label: "2月30日のロールオーバー", input: "2026-02-30T00:00:00Z" },
  { label: "平年の2月29日", input: "2026-02-29T00:00:00Z" },
  { label: "不正な時 (25)", input: "2026-11-27T25:00:00Z" },
  { label: "不正な分 (60)", input: "2026-11-27T09:60:00Z" },
  { label: "不正な秒 (60)", input: "2026-11-27T09:00:60Z" },
  { label: "不正なオフセット時 (+24:00)", input: "2026-11-27T09:00:00+24:00" },
  { label: "不正なオフセット分 (+09:60)", input: "2026-11-27T09:00:00+09:60" },
  { label: "重複した T 区切り", input: "2026-11-27T09:00:00T00:00:00Z" },
  { label: "時刻部が不正", input: "2026-11-27T99:00" },
  { label: "日付でない文字列", input: "not-a-date" },
  { label: "数値文字列", input: "12345" },
])("不正な日時文字列（$label）はデコードに失敗すること", ({ input }) => {
  expect(() => Schema.decodeUnknownSync(IsoDateTimeSchema)(input)).toThrow();
});
