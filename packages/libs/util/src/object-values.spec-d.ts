import { expectTypeOf, it } from "vitest";

import { type objectValues } from "./object-values.js";

it("返り値がオブジェクトの値の配列型であること", () => {
  expectTypeOf<
    ReturnType<typeof objectValues<{ readonly a: number; readonly b: string; readonly c: boolean }>>
  >().toEqualTypeOf<readonly (number | string | boolean)[]>();
});

it("空オブジェクトの場合は never[] であること", () => {
  expectTypeOf<ReturnType<typeof objectValues<Record<never, never>>>>().toEqualTypeOf<
    readonly never[]
  >([] as readonly never[]);
});
