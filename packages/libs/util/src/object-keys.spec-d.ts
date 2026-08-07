import { expectTypeOf, it } from "vitest";

import { type objectKeys } from "./object-keys.js";

it("返り値がオブジェクトのキーの配列型であること", () => {
  expectTypeOf<
    ReturnType<typeof objectKeys<{ readonly a: number; readonly b: string; readonly c: boolean }>>
  >().toEqualTypeOf<readonly ("a" | "b" | "c")[]>();
});

it("空オブジェクトの場合は never[] であること", () => {
  expectTypeOf<ReturnType<typeof objectKeys<Record<never, never>>>>().toEqualTypeOf<
    readonly never[]
  >([] as readonly never[]);
});
