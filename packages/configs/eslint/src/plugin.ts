import { type ESLint } from "eslint";

import { exportRoleSuffixesRule } from "./rules/export-role-suffixes/index.js";
import { outboundPartitioningRule } from "./rules/outbound-partitioning/index.js";

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
    "outbound-partitioning": outboundPartitioningRule,
  },
};
