import { type ESLint } from "eslint";
import { defineConfig } from "eslint/config";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import globals from "globals";

export const react = defineConfig(
  {
    ...reactPlugin.configs.flat["recommended"],
    files: ["**/*.{jsx,tsx}"],
  },
  {
    ...reactPlugin.configs.flat["jsx-runtime"],
    files: ["**/*.{jsx,tsx}"],
  },
  {
    plugins: {
      "react-hooks": reactHooksPlugin as ESLint.Plugin,
    },
    rules: reactHooksPlugin.configs["recommended-latest"].rules,
    files: ["**/*.{jsx,tsx}"],
  },
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
);
