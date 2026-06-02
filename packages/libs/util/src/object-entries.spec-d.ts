import { expectTypeOf, it } from "vitest";

import { type objectEntries } from "./object-entries.js";

it("返り値がオブジェクトのエントリーの配列型であること", () => {
  expectTypeOf<ReturnType<typeof objectEntries<{ a: number; b: string }>>>().toEqualTypeOf<
    ([key: "a", value: number] | [key: "b", value: string])[]
  >();
});

it("空オブジェクトの場合は never[] であること", () => {
  expectTypeOf<ReturnType<typeof objectEntries<Record<never, never>>>>().toEqualTypeOf<never[]>();
});
