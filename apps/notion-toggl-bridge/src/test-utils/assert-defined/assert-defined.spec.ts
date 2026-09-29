import { expect, it } from "vitest";

import { assertDefined } from "./assert-defined.js";

it("undefined のとき、例外を送出すること", () => {
  expect(() => {
    assertDefined(undefined);
  }).toThrow("値が未定義です");
});
