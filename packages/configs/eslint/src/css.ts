import pluginCss from "@eslint/css";
import { defineConfig } from "eslint/config";

export const css = defineConfig({
  files: ["**/*.css"],
  language: "css/css",
  extends: [pluginCss.configs.recommended],
});
