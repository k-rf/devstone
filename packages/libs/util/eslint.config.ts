import {
  base,
  functional,
  importConfig,
  jsdoc,
  json,
  markdown,
  namingConvention,
  node,
  singleFunctionPerFile,
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
  functional,
  importConfig,
  jsdoc,
  json,
  markdown,
  namingConvention,
  node,
  singleFunctionPerFile,
  sonarjs,
  unicorn,
);

export default config;
