import { type Node } from "@devstone/libs-json-canvas-spec";

export const assertNode: (node: Node | undefined) => asserts node is Node = (node) => {
  if (!node) throw new Error("Not a node");
};
