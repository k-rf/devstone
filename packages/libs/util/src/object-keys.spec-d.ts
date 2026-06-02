import { expectTypeOf, it } from "vitest";

import { type objectKeys } from "./object-keys.js";

it("返り値がオブジェクトのキーの配列型であること", () => {
  expectTypeOf<ReturnType<typeof objectKeys<{ a: number; b: string; c: boolean }>>>().toEqualTypeOf<
    ("a" | "b" | "c")[]
  >();
});

it("空オブジェクトの場合は never[] であること", () => {
  expectTypeOf<ReturnType<typeof objectKeys<Record<never, never>>>>().toEqualTypeOf<never[]>(
    [] as never[],
  );
});
