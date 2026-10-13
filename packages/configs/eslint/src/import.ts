import { defineConfig } from "eslint/config";
import { flatConfigs } from "eslint-plugin-import-x";

export const importConfig = defineConfig(
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    extends: [flatConfigs.recommended, flatConfigs.typescript],
    rules: {
      "import-x/order": [
        "error",
        {
          "groups": ["builtin", "external", "internal", "parent", "sibling", "index", "object"],
          "newlines-between": "always",
          "alphabetize": { order: "asc", orderImportKind: "asc", caseInsensitive: false },
          "named": { enabled: true, types: "types-last" },
        },
      ],
    },
  },
  {
    name: "devstone/layer-boundary",
    files: ["**/src/core/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      "import-x/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/core",
              from: "./src/adapter",
              message: "Core層はAdapter層に依存してはいけません。",
            },
            {
              target: "./src/core/domain",
              from: "./src/core/application",
              message: "Domain層はApplication層に依存してはいけません。",
            },
            {
              target: "./src/core/domain",
              from: "./src/core/port",
              message: "Domain層はPort層に依存してはいけません。",
            },
          ],
        },
      ],
    },
  },
);
