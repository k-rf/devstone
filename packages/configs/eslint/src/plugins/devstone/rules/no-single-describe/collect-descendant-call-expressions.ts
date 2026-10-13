import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isAstNode = (value: unknown): value is TSESTree.Node =>
  isRecord(value) && typeof value["type"] === "string";

const collectChildNodes = (node: TSESTree.Node): readonly TSESTree.Node[] => {
  return Object.entries(node).flatMap(([key, value]) => {
    if (key === "parent") return [];

    if (Array.isArray(value)) return value.filter(isAstNode);

    return isAstNode(value) ? [value] : [];
  });
};

const collectDescendantNodes = (node: TSESTree.Node): readonly TSESTree.Node[] => {
  const children = collectChildNodes(node);
  return [...children, ...children.flatMap(collectDescendantNodes)];
};

/**
 * 指定されたノード配下（子孫）に存在するすべての CallExpression を収集する。
 */
export const collectDescendantCallExpressions = (
  node: TSESTree.Node,
): readonly TSESTree.CallExpression[] => {
  return collectDescendantNodes(node).filter(
    (n): n is TSESTree.CallExpression => n.type === AST_NODE_TYPES.CallExpression,
  );
};
