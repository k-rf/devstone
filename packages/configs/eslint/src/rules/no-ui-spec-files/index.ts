import { ESLintUtils } from "@typescript-eslint/utils";

import { type MessageIds, type Options } from "./types.js";

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/k-rf/devstone/blob/main/packages/configs/eslint/docs/rules/${name}.md`,
);

const excludedDirectoryPattern =
  /(?:^|\/)(?:packages\/design-system|integration|e2e|end-to-end)\//u;
const uiSpecFilenamePattern = /\.spec\.(?:tsx|jsx)$/u;

/**
 * UI コンポーネントの個別テストファイルを禁止し、Storybook の play 関数への集約を強制する。
 */
export const noUiSpecFilesRule = createRule<Options, MessageIds>({
  name: "no-ui-spec-files",
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow UI component spec files so UI tests and user interactions are centralized in Storybook play functions.",
    },
    schema: [],
    messages: {
      noUiSpecFiles:
        "UI コンポーネントの個別テストファイルは作成できません。Storybook の play 関数に検証を記述してください。",
    },
  },
  create: (context) => {
    const normalizedFilename = context.filename.replaceAll("\\", "/");

    if (
      !uiSpecFilenamePattern.test(normalizedFilename) ||
      excludedDirectoryPattern.test(normalizedFilename)
    ) {
      return {};
    }

    return {
      Program: (node) => {
        context.report({
          node: node,
          messageId: "noUiSpecFiles",
        });
      },
    };
  },
});
