import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * 式チェーンのルートにある Identifier を取得する。
 */
export const getCalleeRootIdentifier = (node: TSESTree.Node): TSESTree.Identifier | undefined => {
  if (node.type === AST_NODE_TYPES.Identifier) {
    return node;
  }
  if (node.type === AST_NODE_TYPES.MemberExpression) {
    return getCalleeRootIdentifier(node.object);
  }
  if (node.type === AST_NODE_TYPES.CallExpression) {
    return getCalleeRootIdentifier(node.callee);
  }
  if (node.type === AST_NODE_TYPES.TaggedTemplateExpression) {
    return getCalleeRootIdentifier(node.tag);
  }
  return undefined;
};
