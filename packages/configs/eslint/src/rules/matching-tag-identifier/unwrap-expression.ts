import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * 型アサーションやラッパーノードを取り除き、内側の式ノードを返す。
 */
export const unwrapExpression = (node: TSESTree.Node): TSESTree.Node => {
  if (
    node.type === AST_NODE_TYPES.TSAsExpression ||
    node.type === AST_NODE_TYPES.TSTypeAssertion ||
    node.type === AST_NODE_TYPES.TSNonNullExpression ||
    node.type === AST_NODE_TYPES.TSSatisfiesExpression ||
    node.type === AST_NODE_TYPES.TSInstantiationExpression
  ) {
    return unwrapExpression(node.expression);
  }

  return node;
};
