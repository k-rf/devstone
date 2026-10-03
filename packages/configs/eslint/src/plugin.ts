import { type ESLint } from "eslint";

import { exportRoleSuffixesRule } from "./rules/export-role-suffixes/index.js";
import { matchingTagIdentifierRule } from "./rules/matching-tag-identifier/index.js";
import { noSingleDescribeRule } from "./rules/no-single-describe/index.js";
import { outboundPartitioningRule } from "./rules/outbound-partitioning/index.js";
import { pathNamingConventionsRule } from "./rules/path-naming-conventions/index.js";
import { singleFunctionPerFileRule } from "./rules/single-function-per-file/index.js";
import { testDescriptionsJapaneseRule } from "./rules/test-descriptions-japanese/index.js";

/**
 * Devstone 固有のカスタム ESLint ルールを提供するプラグイン。
 */
export const plugin: ESLint.Plugin = {
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
    "outbound-partitioning": outboundPartitioningRule,
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    "path-naming-conventions": pathNamingConventionsRule,
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    "single-function-per-file": singleFunctionPerFileRule,
    // @ts-expect-error ESLint 10 の Plugin 型と @typescript-eslint/utils の RuleModule 型の互換性吸収
    "test-descriptions-japanese": testDescriptionsJapaneseRule,
  },
};
