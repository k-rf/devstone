import { expectTypeOf, it } from "vitest";

import { type objectValues } from "./object-values.js";

it("返り値がオブジェクトの値の配列型であること", () => {
  expectTypeOf<
    ReturnType<typeof objectValues<{ a: number; b: string; c: boolean }>>
  >().toEqualTypeOf<(number | string | boolean)[]>();
});

it("空オブジェクトの場合は never[] であること", () => {
  expectTypeOf<ReturnType<typeof objectValues<Record<never, never>>>>().toEqualTypeOf<never[]>(
    [] as never[],
  );
});
