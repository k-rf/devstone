import { NodeId, type Node } from "@devstone/libs-json-canvas-spec";
import { expectTypeOf, it } from "vitest";

import { findNode } from "./find-node.js";

it("型の絞り込みが正しいこと", () => {
  const [node, index] = findNode([], NodeId.make(""));

  if (node) {
    expectTypeOf(node).toEqualTypeOf<Node>();
    expectTypeOf(index).toEqualTypeOf<number>();
  } else {
    expectTypeOf(node).toEqualTypeOf<undefined>();
    expectTypeOf(index).toEqualTypeOf<-1>();
  }
});
