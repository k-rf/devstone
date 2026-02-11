import markdownPlugin from "@eslint/markdown";
import { defineConfig } from "eslint/config";

export const markdown = defineConfig(
  ...markdownPlugin.configs.recommended.map((config) => ({
    ...config,
    language: "markdown/gfm",
  })),
);
