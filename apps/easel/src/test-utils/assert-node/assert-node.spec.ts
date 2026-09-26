import { expect, it } from "vitest";

import { assertNode } from "./assert-node.js";

it("Nodeではないとき、例外を送出すること", () => {
  expect(() => {
    assertNode(undefined);
  }).toThrow("Not a node");
});
