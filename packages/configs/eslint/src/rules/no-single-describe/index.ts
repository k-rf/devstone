import { ESLintUtils, type TSESTree } from "@typescript-eslint/utils";

import { collectDescendantCallExpressions } from "./collect-descendant-call-expressions.js";
import { isDescribeCall } from "./is-describe-call.js";
import { isHookCall } from "./is-hook-call.js";
import { isTestCaseCall } from "./is-test-case-call.js";
import { isTestFile } from "./is-test-file.js";
import { type MessageIds, type Options } from "./types.js";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/k-rf/devstone/blob/main/packages/configs/eslint/docs/rules/${name}.md`,
);

/**
 * テストファイル内に単一の describe しか存在しない場合、
 * 冗長な describe グループ化を省略し、直接 it / test を平坦に記述することを強制する。
 */
export const noSingleDescribeRule = createRule<Options, MessageIds>({
  name: "no-single-describe",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a single top-level describe block when direct test cases can be written flatly without extra nesting.",
    },
    schema: [],
    messages: {
      noSingleDescribe:
        "テストファイル内に単一の describe しか存在しない場合は、冗長なグループ化を省略し、テストケース（it / test）を直接記述してください。",
    },
  },
  create: (context) => {
    if (!isTestFile(context.filename)) {
      return {};
    }

    return {
      "Program:exit": (program: TSESTree.Program) => {
        const fileCallExpressions = collectDescendantCallExpressions(program);
        const describeCalls = fileCallExpressions.filter(isDescribeCall);

        if (describeCalls.length !== 1) {
          return;
        }

        const singleDescribe = describeCalls.find(
          (call) => !collectDescendantCallExpressions(call).some(isHookCall),
        );
        if (singleDescribe === undefined) {
          return;
        }

        const hasTest = collectDescendantCallExpressions(singleDescribe).some(isTestCaseCall);
        if (!hasTest) {
          return;
        }

        context.report({
          node: singleDescribe,
          messageId: "noSingleDescribe",
        });
      },
    };
  },
});
