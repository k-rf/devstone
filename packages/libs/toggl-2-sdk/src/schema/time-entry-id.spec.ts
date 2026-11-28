import { Schema } from "effect";
import { expect, it } from "vitest";

import { Toggl2TimeEntryId } from "./time-entry-id.js";

it("正の整数を Toggl2TimeEntryId としてデコードできること", () => {
  expect(Schema.decodeUnknownSync(Toggl2TimeEntryId)(3003)).toBe(3003);
});

it.each([
  { label: "0", value: 0 },
  { label: "負数", value: -1 },
  { label: "小数", value: 1.5 },
  { label: "文字列", value: "3003" },
])("不正な値（$label）は Toggl2TimeEntryId のデコードに失敗すること", ({ value }) => {
  expect(() => Schema.decodeUnknownSync(Toggl2TimeEntryId)(value)).toThrow();
});
