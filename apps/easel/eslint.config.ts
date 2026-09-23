import {
  base,
  effectAssertErrorFlip,
  exportRoleSuffixes,
  functional,
  importConfig,
  jsdoc,
  json,
  layerBoundary,
  logicFreeInboundAdapters,
  markdown,
  namingConvention,
  noCoreSideEffects,
  noThrowInProduction,
  node,
  outboundPartitioning,
  pathNamingConventions,
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
  effectAssertErrorFlip,
  exportRoleSuffixes,
  functional,
  importConfig,
  jsdoc,
  json,
  layerBoundary,
  logicFreeInboundAdapters,
  markdown,
  namingConvention,
  noCoreSideEffects,
  noThrowInProduction,
  node,
  outboundPartitioning,
  pathNamingConventions,
  singleFunctionPerFile,
  sonarjs,
  unicorn,
);

export default config;
