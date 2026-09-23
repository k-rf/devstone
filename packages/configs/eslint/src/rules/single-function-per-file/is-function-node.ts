import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { match } from "ts-pattern";

/**
 * ノードが関数宣言・アロー関数・関数式のいずれかであるかを判定する。
 */
export const isFunctionNode = (node: TSESTree.Node | null | undefined): boolean => {
  if (node === null || node === undefined) return false;

  const { FunctionDeclaration, ArrowFunctionExpression, FunctionExpression } = AST_NODE_TYPES;

  return match(node.type)
    .with(FunctionDeclaration, ArrowFunctionExpression, FunctionExpression, () => true)
    .otherwise(() => false);
};
