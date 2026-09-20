import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * ノードが関数宣言・アロー関数・関数式のいずれかであるかを判定する。
 */
export const isFunctionNode = (node: TSESTree.Node | null | undefined): boolean => {
  if (node === null || node === undefined) return false;

  return (
    node.type === AST_NODE_TYPES.FunctionDeclaration ||
    node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    node.type === AST_NODE_TYPES.FunctionExpression
  );
};
