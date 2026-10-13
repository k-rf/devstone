import { type ESLint } from "eslint";

import { recommended } from "./configs/index.js";
import {
  exportRoleSuffixesRule,
  matchingTagIdentifierRule,
  noSingleDescribeRule,
  noUiSpecFilesRule,
  outboundPartitioningRule,
  pathNamingConventionsRule,
  singleFunctionPerFileRule,
  testDescriptionsJapaneseRule,
} from "./rules/index.js";

/**
 * Devstone 固有のカスタム ESLint ルールを提供するプラグイン。
 */
export const plugin = {
  meta: {
    name: "devstone",
    version: "1.0.0",
  },
  rules: {
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    "export-role-suffixes": exportRoleSuffixesRule,
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    "matching-tag-identifier": matchingTagIdentifierRule,
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    "no-single-describe": noSingleDescribeRule,
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    "no-ui-spec-files": noUiSpecFilesRule,
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    "outbound-partitioning": outboundPartitioningRule,
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    "path-naming-conventions": pathNamingConventionsRule,
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    "single-function-per-file": singleFunctionPerFileRule,
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    "test-descriptions-japanese": testDescriptionsJapaneseRule,
  },
  configs: {
    recommended: recommended,
  },
} as const satisfies ESLint.Plugin;
