import { DateTime, Option, Schema } from "effect";
import { expect, it } from "vitest";

import { ModifyEntriesInput } from "./modify-entries.input.js";

it("有効な ModifyEntriesInput をデコードできること", () => {
  const decoded = Schema.decodeUnknownSync(ModifyEntriesInput)({
    since: Option.some(DateTime.unsafeMake("2026-11-20T00:00:00Z")),
    until: Option.none(),
    days: 3650,
    dryRun: false,
  });

  expect(decoded.days).toBe(3650);
  expect(decoded.dryRun).toBe(false);
});

it.each([
  {
    label: "days が 0",
    payload: { since: Option.none(), until: Option.none(), days: 0, dryRun: false },
  },
  {
    label: "days が負数",
    payload: { since: Option.none(), until: Option.none(), days: -1, dryRun: false },
  },
  {
    label: "days が小数",
    payload: { since: Option.none(), until: Option.none(), days: 1.5, dryRun: false },
  },
  {
    label: "days が上限超過 (3651)",
    payload: { since: Option.none(), until: Option.none(), days: 3651, dryRun: false },
  },
])("不正な ModifyEntriesInput（$label）はデコードに失敗すること", ({ payload }) => {
  expect(() => Schema.decodeUnknownSync(ModifyEntriesInput)(payload)).toThrow();
});
