import { defineConfig } from "eslint/config";

import {
  base,
  devstone,
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
      "automations/",
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
  devstone,
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
