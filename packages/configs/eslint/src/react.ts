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
    rules: {
      /** @remarks propsの仮引数の書き方を統一する */
      "react/destructuring-assignment": ["error", "always"],

      /** @remarks propsの記述順序を統一する */
      "react/jsx-sort-props": [
        "error",
        {
          callbacksLast: true,
          ignoreCase: false,
          multiline: "last",
          noSortAlphabetically: false,
          reservedFirst: true,
          shorthandFirst: true,
        },
      ],

      /** @remarks boolean型の冗長な記述を避ける */
      "react/jsx-boolean-value": ["error", "never"],

      /** @remarks コンポーネントの外形的な命名規則をある程度統一する */
      "react/jsx-pascal-case": ["error", { allowNamespace: true }],

      /** @remarks useStateの戻り値の書き方を統一する */
      "react/hook-use-state": ["error", { allowDestructuredState: true }],

      /** @remarks Fragmentの書き方を統一する */
      "react/jsx-fragments": ["error", "syntax"],
    },
  },
);
