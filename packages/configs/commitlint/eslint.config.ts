import {
  base,
  cspell,
  importConfig,
  json,
  markdown,
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
  importConfig,
  json,
  markdown,
  node,
  sonarjs,
  unicorn,
);

export default config;
