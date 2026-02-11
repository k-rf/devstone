import jsonPlugin from "@eslint/json";
import { defineConfig } from "eslint/config";

export const json = defineConfig(
  {
    files: ["**/*.json"],
    ignores: ["**/package-lock.json"],
    language: "json/json",
    ...jsonPlugin.configs.recommended,
  },
  {
    files: ["**/*.jsonc", ".vscode/*.json", "tsconfig*.json"],
    language: "json/jsonc",
    ...jsonPlugin.configs.recommended,
  },
);
