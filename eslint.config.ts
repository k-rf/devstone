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
} from "@devstone/configs-eslint";

const config = defineConfig(
  {
    ignores: [
      "node_modules/",
      "coverage/",
      "dist/",
      ".pnpm-store/",
      ".moon/",
      "apps/",
      "packages/",
    ],
  },
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
);

export default config;
