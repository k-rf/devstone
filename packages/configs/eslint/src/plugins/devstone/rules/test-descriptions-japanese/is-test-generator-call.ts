import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

const generatorPropertyNames = new Set(["each", "for", "skipIf", "runIf"]);

/**
 * テスト修飾子のジェネレータ呼び出し（it.each, it.skipIf 等）であるかを判定する。
 */
export const isTestGeneratorCall = (node: TSESTree.CallExpression): boolean => {
  if (node.callee.type !== AST_NODE_TYPES.MemberExpression) return false;

  const property = node.callee.property;
  if (property.type !== AST_NODE_TYPES.Identifier) return false;

  return generatorPropertyNames.has(property.name);
};
