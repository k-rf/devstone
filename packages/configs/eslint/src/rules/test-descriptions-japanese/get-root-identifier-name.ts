import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * 呼び出しチェーンまたは式の根本となる識別子名を取得する。
 */
export const getRootIdentifierName = (node: TSESTree.Node): string | undefined => {
  switch (node.type) {
    case AST_NODE_TYPES.Identifier: {
      return node.name;
    }
    case AST_NODE_TYPES.MemberExpression: {
      return getRootIdentifierName(node.object);
    }
    case AST_NODE_TYPES.CallExpression: {
      return getRootIdentifierName(node.callee);
    }
    case AST_NODE_TYPES.TaggedTemplateExpression: {
      return getRootIdentifierName(node.tag);
    }
    default: {
      return undefined;
    }
  }
};
