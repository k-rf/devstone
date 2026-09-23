import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { match } from "ts-pattern";

/**
 * クラス宣言がエラー定義クラス（Error または Data.TaggedError を継承）かどうかを判定する。
 */
export const isErrorClass = (node: TSESTree.ClassDeclaration): boolean => {
  const { Identifier, CallExpression, MemberExpression } = AST_NODE_TYPES;

  return match(node.superClass)
    .with({ type: Identifier }, ({ name }) => name.endsWith("Error"))
    .with(
      {
        type: CallExpression,
        callee: {
          type: MemberExpression,
          property: {
            type: Identifier,
            name: "TaggedError",
          },
        },
      },
      () => true,
    )
    .otherwise(() => false);
};
