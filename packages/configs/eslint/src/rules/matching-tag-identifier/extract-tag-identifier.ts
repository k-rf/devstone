import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

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

  if (firstArgument.type === AST_NODE_TYPES.Literal && typeof firstArgument.value === "string") {
    return {
      argumentNode: firstArgument,
      value: firstArgument.value,
    };
  }

  if (
    firstArgument.type === AST_NODE_TYPES.TemplateLiteral &&
    firstArgument.expressions.length === 0 &&
    firstArgument.quasis.length === 1
  ) {
    const rawValue = firstArgument.quasis[0]?.value.raw;
    return {
      argumentNode: firstArgument,
      value: rawValue,
    };
  }

  return {
    argumentNode: firstArgument,
    value: undefined,
  };
};
