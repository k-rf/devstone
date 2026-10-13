import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { match } from "ts-pattern";

const {
  TSAsExpression,
  TSTypeAssertion,
  TSNonNullExpression,
  TSSatisfiesExpression,
  TSInstantiationExpression,
} = AST_NODE_TYPES;

/**
 * 型アサーションやラッパーノードを取り除き、内側の式ノードを返す。
 */
export const unwrapExpression = (node: TSESTree.Node): TSESTree.Node =>
  match(node)
    .with(
      { type: TSAsExpression },
      { type: TSTypeAssertion },
      { type: TSNonNullExpression },
      { type: TSSatisfiesExpression },
      { type: TSInstantiationExpression },
      (wrapped) => unwrapExpression(wrapped.expression),
    )
    .otherwise((unwrapped) => unwrapped);
