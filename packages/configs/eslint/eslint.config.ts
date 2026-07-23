import { defineConfig } from "eslint/config";

import {
  base,
  cspell,
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
  { ignores: ["dist/"] },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  base,
  cspell,
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
