import {
  base,
  functional,
  hexagonalBoundary,
  importConfig,
  jsdoc,
  json,
  namingConvention,
  noCoreSideEffects,
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
  functional,
  hexagonalBoundary,
  importConfig,
  jsdoc,
  json,
  namingConvention,
  noCoreSideEffects,
  sonarjs,
  unicorn,
);

export default config;
