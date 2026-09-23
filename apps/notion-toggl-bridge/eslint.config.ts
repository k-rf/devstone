import {
  base,
  effectAssertErrorFlip,
  functional,
  importConfig,
  jsdoc,
  json,
  layerBoundary,
  logicFreeInboundAdapters,
  namingConvention,
  noCoreSideEffects,
  noThrowInProduction,
  outboundPartitioning,
  pathNamingConventions,
  singleFunctionPerFile,
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
  effectAssertErrorFlip,
  functional,
  importConfig,
  jsdoc,
  json,
  layerBoundary,
  logicFreeInboundAdapters,
  namingConvention,
  noCoreSideEffects,
  noThrowInProduction,
  outboundPartitioning,
  pathNamingConventions,
  singleFunctionPerFile,
  sonarjs,
  unicorn,
);

export default config;
