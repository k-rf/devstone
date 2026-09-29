import { NodeId, type Node } from "@devstone/libs-json-canvas-spec";
import { describe, expect, it } from "vitest";

import { findNode } from "./find-node.js";

describe("正常系", () => {
  it("指定された ID のノードが存在する場合、該当ノードとそのインデックスを返すこと", () => {
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
});

describe("異常系", () => {
  it("指定された ID のノードが存在しない場合、undefined と -1 を返すこと", () => {
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
});
