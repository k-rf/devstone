import { defineConfig } from "eslint/config";

import { plugin } from "./plugin.js";

/**
 * Outbound Port と Adapter を外部サービス単位のディレクトリに分割することを強制する。
 */
export const outboundPartitioning = defineConfig({
  name: "devstone/outbound-partitioning",
  files: [
    "**/core/port/outbound/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    "**/adapter/outbound/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
  ],
  plugins: {
    devstone: plugin,
  },
  rules: {
    "devstone/outbound-partitioning": "error",
  },
});
