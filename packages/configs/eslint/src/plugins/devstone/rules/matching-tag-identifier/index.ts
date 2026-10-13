import { ESLintUtils } from "@typescript-eslint/utils";

import { checkClassNode } from "./check-class-node.js";
import { type MessageIds, type Options } from "./types.js";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/k-rf/devstone/blob/main/packages/configs/eslint/docs/rules/${name}.md`,
);

/**
 * Context.Tag または Data.TaggedError を継承するクラスの識別子文字列が、クラス名と一致していることを強制する。
 */
export const matchingTagIdentifierRule = createRule<Options, MessageIds>({
  name: "matching-tag-identifier",
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce that classes extending Context.Tag or Data.TaggedError pass an identifier matching the class name.",
    },
    schema: [],
    messages: {
      anonymousClass:
        "{{calleeName}} を継承するクラスには名前が必要です。名前を解決できない匿名クラスでの継承は禁止されています。",
      invalidIdentifier:
        "{{calleeName}} の第1引数には、クラス名 '{{className}}' と一致する文字列リテラルを指定してください。",
      mismatchedIdentifier:
        "{{calleeName}} のタグ識別子 '{{tagIdentifier}}' はクラス名 '{{className}}' と一致していなければなりません。",
    },
  },
  create: (context) => {
    return {
      ClassDeclaration: (node) => {
        checkClassNode(context, node);
      },
      ClassExpression: (node) => {
        checkClassNode(context, node);
      },
    };
  },
});
