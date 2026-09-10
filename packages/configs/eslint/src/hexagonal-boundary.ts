import { defineConfig } from "eslint/config";

/**
 * Core 層から Adapter 層への依存、および Core 内のレイヤー違反を禁止する境界設定。
 */
export const hexagonalBoundary = defineConfig({
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
});
