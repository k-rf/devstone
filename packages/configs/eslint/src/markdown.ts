import pluginMarkdown from "@eslint/markdown";
import { defineConfig } from "eslint/config";

export const markdown = defineConfig({
  files: ["**/*.md"],
  plugins: { markdown: pluginMarkdown },
  language: "markdown/gfm",
  extends: [pluginMarkdown.configs.recommended],
  rules: {
    "markdown/no-missing-label-refs": [
      "error",
      {
        allowLabels: ["!NOTE", "!TIP", "!IMPORTANT", "!WARNING", "!CAUTION"],
      },
    ],
  },
});
