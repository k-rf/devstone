import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import { configs } from "typescript-eslint";

export const base = defineConfig(
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    extends: [eslint.configs.recommended],
  },
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    extends: [configs.strictTypeChecked, configs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      /** @remarks 定義ジャンプを一発でできるようにするため、キーと値は分けて記述するように強制する */
      "object-shorthand": ["error", "never"],

      /** @remarks インラインで型のインポートを指定することで、型のインポートを強調する */
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],

      /** @remarks `as unknown as T` は型安全性を完全に破壊するため禁止する */
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "TSAsExpression:has(> TSAsExpression.expression[typeAnnotation.type='TSUnknownKeyword'])",
          message:
            "`as unknown as` は型チェックを完全に迂回します。型安全になるように実装を見直してください。",
        },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    extends: [configs.disableTypeChecked],
  },
);
