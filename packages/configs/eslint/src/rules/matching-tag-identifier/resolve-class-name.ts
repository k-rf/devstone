import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

const unwrapParent = (node: TSESTree.Node): TSESTree.Node => {
  if (
    node.type === AST_NODE_TYPES.TSAsExpression ||
    node.type === AST_NODE_TYPES.TSTypeAssertion ||
    node.type === AST_NODE_TYPES.TSNonNullExpression ||
    node.type === AST_NODE_TYPES.TSSatisfiesExpression ||
    node.type === AST_NODE_TYPES.TSInstantiationExpression
  ) {
    return unwrapParent(node.parent);
  }
  return node;
};

/**
 * クラス宣言またはクラス式のクラス名を解決する。
 * 無名クラス式の場合は、変数宣言や代入先、プロパティ名から名前を解決する。
 */
export const resolveClassName = (
  node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
): string | undefined => {
  if (node.id !== null) {
    return node.id.name;
  }

  const effectiveParent = unwrapParent(node.parent);

  if (
    effectiveParent.type === AST_NODE_TYPES.VariableDeclarator &&
    effectiveParent.id.type === AST_NODE_TYPES.Identifier
  ) {
    return effectiveParent.id.name;
  }

  if (
    effectiveParent.type === AST_NODE_TYPES.AssignmentExpression &&
    effectiveParent.left.type === AST_NODE_TYPES.Identifier
  ) {
    return effectiveParent.left.name;
  }

  if (effectiveParent.type === AST_NODE_TYPES.Property && !effectiveParent.computed) {
    if (effectiveParent.key.type === AST_NODE_TYPES.Identifier) {
      return effectiveParent.key.name;
    }
    if (typeof effectiveParent.key.value === "string") {
      return effectiveParent.key.value;
    }
  }

  return undefined;
};
