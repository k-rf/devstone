import { type Node } from "@devstone/libs-json-canvas-spec";

export const assertNode: (node: Node | undefined) => asserts node is Node = (node) => {
  if (!node) throw new Error("Not a node");
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("Nodeではないとき、例外を送出すること", () => {
    expect(() => {
      assertNode(undefined);
    }).toThrow("Not a node");
  });
}
