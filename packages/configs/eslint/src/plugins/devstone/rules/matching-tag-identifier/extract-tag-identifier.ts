import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { P, match } from "ts-pattern";

const { Literal, TemplateLiteral } = AST_NODE_TYPES;

export interface ExtractedTagIdentifier {
  readonly argumentNode: TSESTree.Node;
  readonly value: string | undefined;
}

/**
 * CallExpression の第1引数からタグ識別子の文字列リテラルを取得する。
 */
export const extractTagIdentifier = (
  callExpression: TSESTree.CallExpression,
): ExtractedTagIdentifier | undefined => {
  const firstArgument = callExpression.arguments[0];
  if (!firstArgument) return undefined;

  return match(firstArgument)
    .with({ type: Literal, value: P.string }, ({ value }) => ({
      argumentNode: firstArgument,
      value: value,
    }))
    .with(
      {
        type: TemplateLiteral,
        expressions: [],
        quasis: [{ value: { raw: P.select() } }],
      },
      (rawValue) => ({
        argumentNode: firstArgument,
        value: rawValue,
      }),
    )
    .otherwise(() => ({
      argumentNode: firstArgument,
      value: undefined,
    }));
};
