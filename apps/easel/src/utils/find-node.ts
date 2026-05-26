import { NodeId, type Node } from "@devstone/libs-json-canvas-spec";

export const findNode = (
  nodes: Node[],
  nodeId: NodeId,
): readonly [node: Node, index: number] | readonly [node: undefined, index: -1] => {
  const index = nodes.findIndex((n) => n.id === nodeId);

  if (index === -1) return [undefined, -1];

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- 上記の if で `undefined` にならないことは保証されている
  return [nodes[index]!, index];
};

if (import.meta.vitest) {
  const { expect, it } = import.meta.vitest;

  it("正常系", () => {
    // Arrange
    const nodes: Node[] = [
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
    const nodes: Node[] = [
      { id: NodeId.make("n1"), type: "text", x: 0, y: 0, width: 10, height: 10, text: "hello" },
      { id: NodeId.make("n2"), type: "text", x: 0, y: 0, width: 10, height: 10, text: "hello" },
    ];

    // Act
    const [node, index] = findNode(nodes, NodeId.make("n3"));

    // Assert
    expect(node).toBeUndefined();
    expect(index).toBe(-1);
  });
}
