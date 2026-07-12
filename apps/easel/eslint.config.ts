import {
  base,
  cspell,
  functional,
  importConfig,
  jsdoc,
  json,
  markdown,
  namingConvention,
  node,
  sonarjs,
  unicorn,
} from "@devstone/configs-eslint";
import { defineConfig } from "eslint/config";

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
  jsdoc,
  json,
  markdown,
  namingConvention,
  node,
  sonarjs,
  unicorn,
);

export default config;
