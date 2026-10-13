import {
  base,
  devstone,
  functional,
  importConfig,
  jsdoc,
  json,
  namingConvention,
  sonarjs,
  unicorn,
} from "@devstone/configs-eslint";
import { defineConfig } from "eslint/config";

const config = defineConfig(
  { ignores: ["node_modules/", "dist/", ".wrangler/"] },
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
  jsdoc,
  json,
  namingConvention,
  sonarjs,
  unicorn,
);

export default config;
