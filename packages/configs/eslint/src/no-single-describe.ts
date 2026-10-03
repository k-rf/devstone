import { defineConfig } from "eslint/config";

import { plugin } from "./plugin.js";

/**
 * テストファイル内に単一の describe しか存在しない場合、
 * 冗長な describe グループ化を省略し、直接 it / test を平坦に記述することを強制する。
 */
export const noSingleDescribe = defineConfig({
  name: "devstone/no-single-describe",
  files: ["**/*.{spec,test}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}", "**/*.{spec-d,test-d}.{ts,mts,cts}"],
  plugins: {
    devstone: plugin,
  },
  rules: {
    "devstone/no-single-describe": "error",
  },
});
