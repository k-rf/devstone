import {
  base,
  effectAssertErrorFlip,
  functional,
  importConfig,
  jsdoc,
  json,
  layerBoundary,
  logicFreeInboundAdapters,
  matchingTagIdentifier,
  namingConvention,
  noCoreSideEffects,
  noSingleDescribe,
  noThrowInProduction,
  noUiSpecFiles,
  outboundPartitioning,
  pathNamingConventions,
  singleFunctionPerFile,
  sonarjs,
  testDescriptionsJapanese,
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
  matchingTagIdentifier,
  namingConvention,
  noCoreSideEffects,
  noSingleDescribe,
  noThrowInProduction,
  noUiSpecFiles,
  outboundPartitioning,
  pathNamingConventions,
  singleFunctionPerFile,
  sonarjs,
  testDescriptionsJapanese,
  unicorn,
);

export default config;
