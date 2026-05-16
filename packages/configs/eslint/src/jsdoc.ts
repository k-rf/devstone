import { defineConfig } from "eslint/config";
import jsdocPlugin from "eslint-plugin-jsdoc";

export const jsdoc = defineConfig({
  files: ["**/*.{ts,mts,cts,tsx,js,mjs,cjs,jsx}"],
  extends: [jsdocPlugin.configs["flat/recommended-typescript"]],
  rules: {
    "jsdoc/check-tag-names": ["error", { definedTags: ["remarks"] }],
  },
});
