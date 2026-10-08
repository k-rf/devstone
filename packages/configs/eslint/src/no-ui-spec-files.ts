import { defineConfig } from "eslint/config";

import { plugin } from "./plugin.js";

/**
 * UI コンポーネントの個別テストを Storybook の play 関数へ集約する。
 */
export const noUiSpecFiles = defineConfig({
  name: "devstone/no-ui-spec-files",
  files: ["**/*.spec.{tsx,jsx}"],
  plugins: {
    devstone: plugin,
  },
  rules: {
    "devstone/no-ui-spec-files": "error",
  },
});
