import { defineConfig } from "eslint/config";

import { plugin } from "./plugin.js";

/**
 * Context.Tag または Data.TaggedError を継承するクラスの識別子文字列が、クラス名と一致していることを強制する。
 */
export const matchingTagIdentifier = defineConfig({
  name: "devstone/matching-tag-identifier",
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  plugins: {
    devstone: plugin,
  },
  rules: {
    "devstone/matching-tag-identifier": "error",
  },
});
