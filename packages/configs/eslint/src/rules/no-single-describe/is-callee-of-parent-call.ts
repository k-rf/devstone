import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * 指定されたノードが親の CallExpression の callee であるかどうか（高階関数呼び出しの中間ノードであるか）を判定する。
 */
export const isCalleeOfParentCall = (node: TSESTree.Node): boolean => {
  return node.parent?.type === AST_NODE_TYPES.CallExpression && node.parent.callee === node;
};
