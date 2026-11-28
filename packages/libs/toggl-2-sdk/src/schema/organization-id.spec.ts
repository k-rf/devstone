import { Schema } from "effect";
import { expect, it } from "vitest";

import { Toggl2OrganizationId } from "./organization-id.js";

it("正の整数を Toggl2OrganizationId としてデコードできること", () => {
  expect(Schema.decodeUnknownSync(Toggl2OrganizationId)(1001)).toBe(1001);
});

it.each([
  { label: "0", value: 0 },
  { label: "負数", value: -1 },
  { label: "小数", value: 1.5 },
  { label: "文字列", value: "1001" },
])("不正な値（$label）は Toggl2OrganizationId のデコードに失敗すること", ({ value }) => {
  expect(() => Schema.decodeUnknownSync(Toggl2OrganizationId)(value)).toThrow();
});
