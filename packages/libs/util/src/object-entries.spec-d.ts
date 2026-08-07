import { expectTypeOf, it } from "vitest";

import { type objectEntries } from "./object-entries.js";

it("返り値がオブジェクトのエントリーの配列型であること", () => {
  expectTypeOf<
    ReturnType<typeof objectEntries<{ readonly a: number; readonly b: string }>>
  >().toEqualTypeOf<
    readonly (readonly [key: "a", value: number] | readonly [key: "b", value: string])[]
  >();
});

it("空オブジェクトの場合は never[] であること", () => {
  expectTypeOf<ReturnType<typeof objectEntries<Record<never, never>>>>().toEqualTypeOf<
    readonly never[]
  >();
});
