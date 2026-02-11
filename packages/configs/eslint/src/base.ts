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
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "inline-type-imports", prefer: "type-imports" },
      ],
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    extends: [configs.disableTypeChecked],
  },
);
