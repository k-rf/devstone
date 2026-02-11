import { type Linter } from "eslint";
import { defineConfig } from "eslint/config";
import { flatConfigs } from "eslint-plugin-import-x";

export const importConfig = defineConfig({
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  extends: [flatConfigs.recommended as Linter.Config, flatConfigs.typescript as Linter.Config],
  rules: {
    "import-x/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "object"],
        "newlines-between": "always",
        "alphabetize": { order: "asc", caseInsensitive: true },
      },
    ],
  },
});
