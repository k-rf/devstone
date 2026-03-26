import { defineConfig } from "eslint/config";

import { base, cspell, importConfig, sonarjs, unicorn } from "@devstone/configs-eslint";

const config = defineConfig(
  { ignores: ["node_modules/", "dist/", "eslint.config.ts"] },
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
  sonarjs,
  unicorn,
);

export default config;
