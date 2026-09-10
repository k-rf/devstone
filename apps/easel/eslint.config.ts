import {
  base,
  exportRoleSuffixes,
  functional,
  importConfig,
  jsdoc,
  json,
  layerBoundary,
  markdown,
  namingConvention,
  noCoreSideEffects,
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
  exportRoleSuffixes,
  functional,
  importConfig,
  jsdoc,
  json,
  layerBoundary,
  markdown,
  namingConvention,
  noCoreSideEffects,
  node,
  sonarjs,
  unicorn,
);

export default config;
