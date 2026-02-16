import { defineConfig } from "eslint/config";

import {
  base,
  cspell,
  importConfig,
  json,
  markdown,
  node,
  sonarjs,
  unicorn,
} from "@devstone/configs-eslint";

const config = defineConfig(
  { ignores: ["node_modules/", "dist/", ".pnpm-store/", ".moon/", "packages/"] },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  base,
  cspell,
  importConfig,
  json,
  markdown,
  node,
  sonarjs,
  unicorn,
);

export default config;
