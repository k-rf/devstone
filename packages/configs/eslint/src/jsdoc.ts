import { defineConfig } from "eslint/config";
import jsdocPlugin from "eslint-plugin-jsdoc";

export const jsdoc = defineConfig(jsdocPlugin.configs["flat/recommended-typescript"], {
  rules: {
    "jsdoc/check-tag-names": ["error", { definedTags: ["remarks"] }],
  },
});
