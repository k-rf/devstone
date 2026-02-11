import cssPlugin from "@eslint/css";
import { defineConfig } from "eslint/config";

export const css = defineConfig({
  files: ["**/*.css"],
  language: "css/css",
  ...cssPlugin.configs.recommended,
});
