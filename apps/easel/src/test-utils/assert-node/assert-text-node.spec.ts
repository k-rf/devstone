import { expect, it } from "vitest";

import { assertTextNode } from "./assert-text-node.js";

it("TextNodeではないとき、例外を送出すること", () => {
  expect(() => {
    assertTextNode(undefined);
  }).toThrow("Not a text node");
});
