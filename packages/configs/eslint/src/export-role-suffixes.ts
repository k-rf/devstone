import { defineConfig } from "eslint/config";

import { plugin } from "./plugin.js";

/**
 * 役割サフィックス付きファイル（`.workflow.ts` / `.activity.ts`）の
 * named export に役割名サフィックスを要求する。
 */
export const exportRoleSuffixes = defineConfig({
  name: "devstone/export-role-suffixes",
  files: ["**/*.workflow.ts", "**/*.activity.ts", "**/*.workflow.tsx", "**/*.activity.tsx"],
  plugins: {
    devstone: plugin,
  },
  rules: {
    "devstone/export-role-suffixes": "error",
  },
});
