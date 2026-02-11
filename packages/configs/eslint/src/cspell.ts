import pluginCspell from "@cspell/eslint-plugin/recommended";
import { type Linter } from "eslint";
import { defineConfig } from "eslint/config";

export const cspell = defineConfig(pluginCspell as Linter.Config, {
  rules: {
    "@cspell/spellchecker": "error",
  },
});
