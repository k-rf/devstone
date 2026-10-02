import { AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/utils";

import { extractDescriptionText } from "./extract-description-text.js";
import { hasJapaneseCharacter } from "./has-japanese-character.js";
import { hasJapaneseInEachTable } from "./has-japanese-in-each-table.js";
import { isTestCaseCall } from "./is-test-case-call.js";
import { type MessageIds, type Options } from "./types.js";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/k-rf/devstone/blob/main/packages/configs/eslint/docs/rules/${name}.md`,
);

/**
 * テスト仕様（it/test）の説明文に日本語を含めることを強制する。
 */
export const testDescriptionsJapaneseRule = createRule<Options, MessageIds>({
  name: "test-descriptions-japanese",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce Japanese descriptions for test cases (it/test).",
    },
    schema: [],
    messages: {
      requireJapaneseDescription:
        "テスト名には日本語（ひらがな、カタカナ、漢字）を含める必要があります。",
    },
  },
  create: (context) => {
    return {
      CallExpression: (node) => {
        if (!isTestCaseCall(node)) return;

        const firstArgument = node.arguments[0];
        if (firstArgument === undefined) {
          context.report({
            node: node,
            messageId: "requireJapaneseDescription",
          });
          return;
        }

        const description = extractDescriptionText(firstArgument);
        if (description !== undefined) {
          if (!hasJapaneseCharacter(description) && !hasJapaneseInEachTable(node, description)) {
            context.report({
              node: firstArgument,
              messageId: "requireJapaneseDescription",
            });
          }
          return;
        }

        if (firstArgument.type === AST_NODE_TYPES.Literal) {
          context.report({
            node: firstArgument,
            messageId: "requireJapaneseDescription",
          });
        }
      },
    };
  },
});
