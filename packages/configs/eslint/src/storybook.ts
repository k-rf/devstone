import { defineConfig } from "eslint/config";
import { configs } from "eslint-plugin-storybook";

export const storybook = defineConfig(
  // @ts-expect-error ESLint 10 の Flat Config 型と eslint-plugin-storybook の型定義の互換性吸収
  ...configs["flat/recommended"],
  {
    files: ["**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)", "**/*.story.@(ts|tsx|js|jsx|mjs|cjs)"],
    rules: {
      /** @remarks Storybook の自動タイトル生成を利用するため、title の明示的な指定を禁止する */
      "storybook/no-title-property-in-meta": "error",

      /** @remarks Meta オブジェクトに satisfies Meta を必須とし、型情報を保持する */
      "storybook/meta-satisfies-type": "error",
    },
  },
);
