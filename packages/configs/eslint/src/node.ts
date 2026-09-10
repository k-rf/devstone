import { defineConfig } from "eslint/config";
import pluginNode from "eslint-plugin-n";
import globals from "globals";

export const node = defineConfig(
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    extends: [pluginNode.configs["flat/recommended-module"]],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      /** @remarks import-x/typescript が対応するため無効化 */
      "n/no-missing-import": "off",

      /** @remarks 循環依存を避けるため、プロジェクトルートにインストールしている */
      "n/no-extraneous-import": ["error", { allowModules: ["@devstone/configs-eslint"] }],

      "n/no-unsupported-features/node-builtins": ["error", { version: ">=24.0.0" }],
    },
  },
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    rules: {
      /** @remarks TypeScript は tsc の target が構文を変換するため、Node がソースを直接実行できるかの検査は適用しない */
      "n/no-unsupported-features/es-syntax": "off",
    },
  },
);
