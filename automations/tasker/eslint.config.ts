import { json, markdown } from "@devstone/configs-eslint";
import { defineConfig } from "eslint/config";

const config = defineConfig(
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  json,
  markdown,
);

export default config;
