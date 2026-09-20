import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import { isErrorClass } from "./is-error-class.js";
import { isFunctionNode } from "./is-function-node.js";
import { type ExportedEntry } from "./types.js";

/**
 * ExportDefaultDeclaration ノードから主要な関数・クラスのエクスポートエントリを収集する。
 */
export const collectDefaultExportEntry = (
  node: TSESTree.ExportDefaultDeclaration,
): ExportedEntry | undefined => {
  const decl = node.declaration;

  if (decl.type === AST_NODE_TYPES.FunctionDeclaration) {
    return { node: node, name: decl.id?.name ?? "default" };
  }

  if (decl.type === AST_NODE_TYPES.ClassDeclaration) {
    if (isErrorClass(decl)) return undefined;
    return { node: node, name: decl.id?.name ?? "default" };
  }

  if (isFunctionNode(decl)) {
    return { node: node, name: "default" };
  }

  return undefined;
};
