import { defineConfig } from "eslint/config";

import { plugin } from "./plugin.js";

/**
 * アーキテクチャ上の配置先に応じたファイル役割サフィックスを要求する。
 */
export const pathNamingConventions = defineConfig({
  name: "devstone/path-naming-conventions",
  files: ["**/*.{ts,tsx}"],
  plugins: {
    devstone: plugin,
  },
  rules: {
    "devstone/path-naming-conventions": "error",
  },
});
