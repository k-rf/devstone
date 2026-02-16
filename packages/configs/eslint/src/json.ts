import pluginJson from "@eslint/json";
import { defineConfig } from "eslint/config";

export const json = defineConfig(
  {
    files: ["**/*.json"],
    ignores: ["**/package-lock.json"],
    language: "json/json",
    extends: [pluginJson.configs.recommended],
  },
  {
    files: ["**/*.jsonc", ".vscode/*.json", "tsconfig*.json"],
    language: "json/jsonc",
    extends: [pluginJson.configs.recommended],
  },
);
