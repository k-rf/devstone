import { defineConfig } from "eslint/config";

import {
  base,
  functional,
  importConfig,
  json,
  markdown,
  namingConvention,
  node,
  sonarjs,
  unicorn,
} from "./src/index.js";

const config = defineConfig(
  { ignores: ["coverage/", "dist/"] },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  base,
  functional,
  importConfig,
  json,
  markdown,
  namingConvention,
  node,
  sonarjs,
  unicorn,
  {
    files: ["src/rules/**/*.ts"],
    rules: {
      /** @remarks ESLint ルールのセレクタ（Program 等）が RuleListener の型定義に従いパスカルケースとなるため */
      "@typescript-eslint/naming-convention": "off",
    },
  },
);

export default config;
