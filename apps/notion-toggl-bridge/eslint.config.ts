import {
  base,
  effectAssertErrorFlip,
  functional,
  importConfig,
  jsdoc,
  json,
  layerBoundary,
  namingConvention,
  noCoreSideEffects,
  outboundPartitioning,
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
  namingConvention,
  noCoreSideEffects,
  outboundPartitioning,
  sonarjs,
  unicorn,
);

export default config;
