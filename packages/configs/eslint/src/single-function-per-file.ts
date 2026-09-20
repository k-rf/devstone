import { defineConfig } from "eslint/config";

import { plugin } from "./plugin.js";

/**
 * 1つのファイルに複数の主要な関数が定義されるのを防ぎ、単一責任の原則（1ファイル1関数）を強制する。
 */
export const singleFunctionPerFile = defineConfig({
  name: "devstone/single-function-per-file",
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  plugins: {
    devstone: plugin,
  },
  rules: {
    "devstone/single-function-per-file": "error",
  },
});
