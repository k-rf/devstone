import {
  base,
  functional,
  importConfig,
  jsdoc,
  json,
  markdown,
  namingConvention,
  noSingleDescribe,
  node,
  singleFunctionPerFile,
  sonarjs,
  testDescriptionsJapanese,
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
  noSingleDescribe,
  node,
  singleFunctionPerFile,
  sonarjs,
  testDescriptionsJapanese,
  unicorn,
);

export default config;
