import { defineConfig } from "eslint/config";
import pluginFunctional from "eslint-plugin-functional";

export const functional = defineConfig({
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  plugins: {
    functional: pluginFunctional,
  },
  rules: {
    /** @remarks 変数宣言における再代入を排除し、const を強制する */
    "functional/no-let": "error",
  },
});
