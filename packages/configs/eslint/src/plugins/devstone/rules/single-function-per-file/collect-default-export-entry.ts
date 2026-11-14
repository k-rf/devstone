import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { match } from "ts-pattern";

import { isErrorClass } from "./is-error-class.js";
import { type ExportedEntry } from "./types.js";

export const collectDefaultExportEntry = (
  node: TSESTree.ExportDefaultDeclaration,
): readonly ExportedEntry[] => {
  const { FunctionDeclaration, ClassDeclaration, TSInterfaceDeclaration } = AST_NODE_TYPES;

  return match(node.declaration)
    .with({ type: TSInterfaceDeclaration }, () => [])
    .with({ type: FunctionDeclaration }, (decl) => [
      { node: node, name: decl.id?.name ?? "default" },
    ])
    .with({ type: ClassDeclaration }, (decl) =>
      isErrorClass(decl) ? [] : [{ node: node, name: decl.id?.name ?? "default" }],
    )
    .otherwise(() => [{ node: node, name: "default" }]);
};
