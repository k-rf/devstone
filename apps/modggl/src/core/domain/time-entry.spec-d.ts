import { type Option } from "effect";
import { describe, expectTypeOf, it } from "vitest";

import { type AbortReason, type RevisionPlan } from "./revision-plan.js";
import { type TimeEntry } from "./time-entry.js";

describe("正常系（ドメイン型制約）", () => {
  it("TimeEntry の任意項目がすべて Option.Option で表現されていること", () => {
    expectTypeOf<TimeEntry["taskId"]>().toEqualTypeOf<Option.Option<number>>();
    expectTypeOf<TimeEntry["projectId"]>().toEqualTypeOf<Option.Option<number>>();
    expectTypeOf<TimeEntry["clientId"]>().toEqualTypeOf<Option.Option<number>>();
  });

  it("TimeEntry の tagIds が不変配列であること", () => {
    expectTypeOf<TimeEntry["tagIds"]>().toEqualTypeOf<readonly number[]>();
  });

  it("RevisionPlan の Aborted 状態の reason が AbortReason と一致すること", () => {
    expectTypeOf<
      Extract<RevisionPlan, { readonly _tag: "Aborted" }>["reason"]
    >().toEqualTypeOf<AbortReason>();
  });
});

describe("異常系（undefined の混入防止）", () => {
  it("TimeEntry の任意項目に undefined を代入できないこと", () => {
    expectTypeOf<undefined>().not.toExtend<TimeEntry["taskId"]>();
    expectTypeOf<undefined>().not.toExtend<TimeEntry["projectId"]>();
    expectTypeOf<undefined>().not.toExtend<TimeEntry["clientId"]>();
  });
});
