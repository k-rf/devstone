import { NodeId, type Node } from "@devstone/libs-json-canvas-spec";
import { expect, it } from "vitest";

import { findNode } from "./find-node.js";

it("正常系", () => {
  // Arrange
  const nodes: readonly Node[] = [
    { id: NodeId.make("n1"), type: "text", x: 0, y: 0, width: 10, height: 10, text: "hello" },
    { id: NodeId.make("n2"), type: "text", x: 0, y: 0, width: 10, height: 10, text: "hello" },
  ];

  // Act
  const [node, index] = findNode(nodes, NodeId.make("n1"));

  // Assert
  expect(node).toEqual(nodes[0]);
  expect(index).toBe(0);
});

it("異常系", () => {
  // Arrange
  const nodes: readonly Node[] = [
    { id: NodeId.make("n1"), type: "text", x: 0, y: 0, width: 10, height: 10, text: "hello" },
    { id: NodeId.make("n2"), type: "text", x: 0, y: 0, width: 10, height: 10, text: "hello" },
  ];

  // Act
  const [node, index] = findNode(nodes, NodeId.make("n3"));

  // Assert
  expect(node).toBeUndefined();
  expect(index).toBe(-1);
});
