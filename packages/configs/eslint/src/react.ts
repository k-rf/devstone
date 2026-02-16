import { type ESLint } from "eslint";
import { defineConfig } from "eslint/config";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export const react = defineConfig(
  {
    ...pluginReact.configs.flat["recommended"],
    files: ["**/*.{jsx,tsx}"],
  },
  {
    ...pluginReact.configs.flat["jsx-runtime"],
    files: ["**/*.{jsx,tsx}"],
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks as ESLint.Plugin,
    },
    rules: pluginReactHooks.configs["recommended-latest"].rules,
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
