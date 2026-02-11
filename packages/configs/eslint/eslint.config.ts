import { defineConfig } from "eslint/config";

import { base, cspell, importConfig, json, markdown, node, sonarjs, unicorn } from "./src/index.js";

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
  importConfig,
  json,
  markdown,
  node,
  sonarjs,
  unicorn,
);

export default config;
