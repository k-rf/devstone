import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * クラス宣言がエラー定義クラス（Error または Data.TaggedError を継承）かどうかを判定する。
 */
export const isErrorClass = (node: TSESTree.ClassDeclaration): boolean => {
  const superClass = node.superClass;
  if (superClass === null) return false;

  if (superClass.type === AST_NODE_TYPES.Identifier) {
    return superClass.name.endsWith("Error");
  }

  if (
    superClass.type === AST_NODE_TYPES.CallExpression &&
    superClass.callee.type === AST_NODE_TYPES.MemberExpression &&
    superClass.callee.property.type === AST_NODE_TYPES.Identifier &&
    superClass.callee.property.name === "TaggedError"
  ) {
    return true;
  }

  return false;
};
