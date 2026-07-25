import { type ESLint } from "eslint";

import { exportRoleSuffixesRule } from "./rules/export-role-suffixes.js";

/**
 * Devstone 固有のカスタム ESLint ルールを提供するプラグイン。
 */
export const plugin = {
  meta: {
    name: "devstone",
    version: "1.0.0",
  },
  rules: {
    "export-role-suffixes": exportRoleSuffixesRule,
  },
} as const satisfies ESLint.Plugin;
