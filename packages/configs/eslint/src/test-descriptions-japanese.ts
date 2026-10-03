import { defineConfig } from "eslint/config";

import { plugin } from "./plugin.js";

/**
 * テストケースの説明（it/test）に日本語の記述を要求する。
 */
export const testDescriptionsJapanese = defineConfig({
  name: "devstone/test-descriptions-japanese",
  files: ["**/*.{spec,test,spec-d,test-d}.{ts,mts,cts,tsx}"],
  plugins: {
    devstone: plugin,
  },
  rules: {
    "devstone/test-descriptions-japanese": "error",
  },
});
