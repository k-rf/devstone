import pluginMarkdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";

export const markdown = defineConfig({
  files: ["**/*.md"],
  plugins: { markdown: pluginMarkdown },
  language: "markdown/gfm",
  extends: [pluginMarkdown.configs.recommended],
});
