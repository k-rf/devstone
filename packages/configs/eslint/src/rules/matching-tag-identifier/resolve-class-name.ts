import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { P, match } from "ts-pattern";

import { noop } from "../libs/noop.js";

const {
  TSAsExpression,
  TSTypeAssertion,
  TSNonNullExpression,
  TSSatisfiesExpression,
  TSInstantiationExpression,
  VariableDeclarator,
  AssignmentExpression,
  Property,
  Identifier,
  Literal,
} = AST_NODE_TYPES;

const unwrapParent = (node: TSESTree.Node): TSESTree.Node =>
  match(node)
    .with(
      { type: TSAsExpression },
      { type: TSTypeAssertion },
      { type: TSNonNullExpression },
      { type: TSSatisfiesExpression },
      { type: TSInstantiationExpression },
      (wrapped) => unwrapParent(wrapped.parent),
    )
    .otherwise((unwrapped) => unwrapped);

/**
 * クラス宣言またはクラス式のクラス名を解決する。
 * 無名クラス式の場合は、変数宣言や代入先、プロパティ名から名前を解決する。
 */
export const resolveClassName = (
  node: TSESTree.ClassDeclaration | TSESTree.ClassExpression,
): string | undefined => {
  if (node.id !== null) return node.id.name;

  const effectiveParent = unwrapParent(node.parent);

  return match(effectiveParent)
    .with({ type: VariableDeclarator, id: { type: Identifier } }, ({ id }) => id.name)
    .with({ type: AssignmentExpression, left: { type: Identifier } }, ({ left }) => left.name)
    .with({ type: Property, computed: false, key: { type: Identifier } }, ({ key }) => key.name)
    .with(
      { type: Property, computed: false, key: { type: Literal, value: P.string } },
      ({ key }) => key.value,
    )
    .otherwise(noop);
};
