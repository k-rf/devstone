import { type Node, type NodeId } from "@devstone/libs-json-canvas-spec";

export const findNode = (
  nodes: readonly Node[],
  nodeId: NodeId,
): readonly [node: Node, index: number] | readonly [node: undefined, index: -1] => {
  const index = nodes.findIndex((n) => n.id === nodeId);

  if (index === -1) return [undefined, -1];

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- 上記の if で `undefined` にならないことは保証されている
  return [nodes[index]!, index];
};
