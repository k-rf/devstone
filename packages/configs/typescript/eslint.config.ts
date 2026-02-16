import { cspell, json, markdown } from "@devstone/configs-eslint";
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
  cspell,
  json,
  markdown,
);

export default config;
