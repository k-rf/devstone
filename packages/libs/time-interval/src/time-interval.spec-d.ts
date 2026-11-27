import { describe, expectTypeOf, it } from "vitest";

import { type IntervalRelation } from "./interval-relation.js";
import { type TimeInstant } from "./time-instant.js";
import { type TimeInterval } from "./time-interval.js";

describe("正常系", () => {
  it("TimeInstant が number を拡張するブランド型であること", () => {
    expectTypeOf<TimeInstant>().toExtend<number>();
  });

  it("TimeInterval が start と end に TimeInstant を持つこと", () => {
    expectTypeOf<TimeInterval>().toExtend<{
      readonly start: TimeInstant;
      readonly end: TimeInstant;
    }>();
  });

  it("IntervalRelation が 9 種類の位置関係リテラルユニオン型と一致すること", () => {
    expectTypeOf<IntervalRelation>().toEqualTypeOf<
      | "Equivalent"
      | "Less"
      | "Greater"
      | "LessOverlap"
      | "GreaterOverlap"
      | "LessInner"
      | "GreaterInner"
      | "LessOuter"
      | "GreaterOuter"
    >();
  });
});

describe("異常系", () => {
  it("素の number が TimeInstant に代入できないこと", () => {
    expectTypeOf<number>().not.toExtend<TimeInstant>();
  });

  it("ブランドのない素のオブジェクトが TimeInterval に代入できないこと", () => {
    expectTypeOf<{
      readonly start: TimeInstant;
      readonly end: TimeInstant;
    }>().not.toExtend<TimeInterval>();
  });
});
