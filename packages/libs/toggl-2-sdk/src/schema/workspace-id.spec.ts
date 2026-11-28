import { Schema } from "effect";
import { expect, it } from "vitest";

import { Toggl2WorkspaceId } from "./workspace-id.js";

it("正の整数を Toggl2WorkspaceId としてデコードできること", () => {
  expect(Schema.decodeUnknownSync(Toggl2WorkspaceId)(2002)).toBe(2002);
});

it.each([
  { label: "0", value: 0 },
  { label: "負数", value: -1 },
  { label: "小数", value: 1.5 },
  { label: "文字列", value: "2002" },
])("不正な値（$label）は Toggl2WorkspaceId のデコードに失敗すること", ({ value }) => {
  expect(() => Schema.decodeUnknownSync(Toggl2WorkspaceId)(value)).toThrow();
});
