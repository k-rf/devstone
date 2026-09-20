import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { type RuleContext } from "@typescript-eslint/utils/ts-eslint";
import { P, match } from "ts-pattern";

import { isErrorClass } from "./is-error-class.js";
import { isFunctionNode } from "./is-function-node.js";
import { isSpecifierReferencingFunction } from "./resolve-exported-specifier.js";
import { type ExportedEntry, type MessageIds, type Options } from "./types.js";

/**
 * ExportNamedDeclaration ノードから主要な関数・クラスのエクスポートエントリを収集する。
 */
export const collectNamedExportEntries = (
  context: RuleContext<MessageIds, Options>,
  node: TSESTree.ExportNamedDeclaration,
): readonly ExportedEntry[] => {
  if (node.exportKind === "type") return [];

  if (node.declaration !== null) {
    return match(node.declaration)
      .with({ type: AST_NODE_TYPES.FunctionDeclaration, id: P.nonNullable }, ({ id, ...decl }) => [
        { node: decl as TSESTree.Node, name: id.name },
      ])
      .with({ type: AST_NODE_TYPES.ClassDeclaration, id: P.nonNullable }, (decl) => {
        if (isErrorClass(decl)) return [];
        return [{ node: decl, name: decl.id.name }];
      })
      .with({ type: AST_NODE_TYPES.VariableDeclaration }, ({ declarations }) =>
        declarations.flatMap((declarator) => {
          if (declarator.id.type === AST_NODE_TYPES.Identifier && isFunctionNode(declarator.init)) {
            return [{ node: declarator, name: declarator.id.name }];
          }
          return [];
        }),
      )
      .otherwise(() => []);
  }

  // 再エクスポート（export { ... } from "..."）は除外
  if (node.source !== null) return [];

  return node.specifiers.flatMap((specifier) => {
    if (isSpecifierReferencingFunction(context, specifier)) {
      const name =
        specifier.exported.type === AST_NODE_TYPES.Identifier
          ? specifier.exported.name
          : specifier.local.name;
      return [{ node: specifier, name: name }];
    }
    return [];
  });
};
