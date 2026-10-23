import { AST_NODE_TYPES } from "@typescript-eslint/utils";

const ignoredKeys = new Set(["parent", "loc", "range"]);

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === "object" && value !== null;

/**
 * 指定された AST ノード配下に特定の名前を持つ Identifier が含まれるかを再帰的に判定する。
 * 循環参照や巨大な AST でのパフォーマンス低下を防ぐため、`parent`、`loc`、`range` の探索はスキップする。
 */
export const hasIdentifier = (node: unknown, name: string): boolean => {
  if (Array.isArray(node)) return node.some((item) => hasIdentifier(item, name));

  if (!isRecord(node)) return false;

  if (node["type"] === AST_NODE_TYPES.Identifier && node["name"] === name) return true;

  return Object.entries(node).some(
    ([key, value]) => !ignoredKeys.has(key) && hasIdentifier(value, name),
  );
};
