import { defineConfig } from "eslint/config";
import nodePlugin from "eslint-plugin-n";
import globals from "globals";

export const node = defineConfig({
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  extends: [nodePlugin.configs["flat/recommended-module"]],
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
  rules: {
    /** @remarks import-x/typescript が対応するため無効化 */
    "n/no-missing-import": "off",

    "n/no-unsupported-features/node-builtins": ["error", { version: ">=24.0.0" }],
  },
});
