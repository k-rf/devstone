import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { type RuleContext } from "@typescript-eslint/utils/ts-eslint";
import { match } from "ts-pattern";

import { isErrorClass } from "./is-error-class.js";
import { isFunctionNode } from "./is-function-node.js";
import { type MessageIds, type Options } from "./types.js";

type ScopeType = ReturnType<RuleContext<MessageIds, Options>["sourceCode"]["getScope"]>;

const findVariableInScope = (
  scope: ScopeType | null,
  name: string,
): ReturnType<ScopeType["set"]["get"]> => {
  if (scope === null) return undefined;

  const variable = scope.set.get(name);
  if (variable !== undefined) return variable;

  return findVariableInScope(scope.upper, name);
};

/**
 * Specifier が参照しているローカルの定義が主要な関数またはクラスであるかを判定する。
 */
export const isSpecifierReferencingFunction = (
  context: RuleContext<MessageIds, Options>,
  specifier: TSESTree.ExportSpecifier,
): boolean => {
  if (specifier.exportKind === "type") return false;

  const localName = (specifier.local as TSESTree.Identifier).name;
  const variable = findVariableInScope(context.sourceCode.getScope(specifier), localName);
  if (variable === undefined) return false;

  const { FunctionDeclaration, ClassDeclaration, VariableDeclarator } = AST_NODE_TYPES;

  return variable.defs.some((definition: { readonly node: TSESTree.Node }) =>
    match(definition.node)
      .with({ type: FunctionDeclaration }, () => true)
      .with({ type: ClassDeclaration }, (node) => !isErrorClass(node))
      .with({ type: VariableDeclarator }, (node) => isFunctionNode(node.init))
      .otherwise(() => false),
  );
};
