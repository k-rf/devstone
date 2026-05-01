import { base, cspell, importConfig, jsdoc, sonarjs, unicorn } from "@devstone/configs-eslint";
import { defineConfig } from "eslint/config";

const config = defineConfig(
  { ignores: ["node_modules/", "dist/", ".wrangler/"] },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  base,
  cspell,
  importConfig,
  jsdoc,
  sonarjs,
  unicorn,
  {
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

export default config;
