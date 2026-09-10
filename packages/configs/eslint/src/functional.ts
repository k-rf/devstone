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

    /** @remarks オブジェクトや配列の宣言で readonly / ReadonlyArray を強制する */
    "functional/prefer-readonly-type": "error",

    /** @remarks オブジェクト・配列への直接的な書き換えや追加を禁止する */
    "functional/immutable-data": "error",

    /** @remarks 命令的なループ処理を排除し、高階関数による宣言的処理を強制する */
    "functional/no-loop-statements": "error",
  },
});
