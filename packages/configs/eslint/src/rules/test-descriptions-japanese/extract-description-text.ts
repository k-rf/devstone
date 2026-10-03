import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

/**
 * AST ノードからテスト名を表す文字列を抽出する。
 */
export const extractDescriptionText = (node: TSESTree.Node): string | undefined => {
  if (node.type === AST_NODE_TYPES.Literal && typeof node.value === "string") return node.value;

  if (node.type === AST_NODE_TYPES.TemplateLiteral) {
    return node.quasis.map((quasi) => quasi.value.raw).join("");
  }

  return undefined;
};
