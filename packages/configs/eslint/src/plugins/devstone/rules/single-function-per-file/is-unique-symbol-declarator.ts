import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import { match } from "ts-pattern";

/**
 * 変数宣言子が `unique symbol` 型注釈を持つかどうかを判定する。
 */
export const isUniqueSymbolDeclarator = (node: TSESTree.VariableDeclarator): boolean => {
  const { TSTypeOperator, TSSymbolKeyword } = AST_NODE_TYPES;

  return match(node.id.typeAnnotation?.typeAnnotation)
    .with(
      {
        type: TSTypeOperator,
        operator: "unique",
        typeAnnotation: { type: TSSymbolKeyword },
      },
      () => true,
    )
    .otherwise(() => false);
};
