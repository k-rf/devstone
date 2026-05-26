import { type Node, type TextNode } from "@devstone/libs-json-canvas-spec";

export const assertTextNode: (node: Node | undefined) => asserts node is TextNode = (node) => {
  if (node?.type !== "text") throw new Error("Not a text node");
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("TextNodeではないとき、例外を送出すること", () => {
    expect(() => {
      assertTextNode(undefined);
    }).toThrow("Not a text node");
  });
}
