import { defineConfig } from "eslint/config";

import { minimal } from "@devstone/configs-eslint";

const config = defineConfig(
  {
    ignores: [
      "**/node_modules/",
      "**/coverage/",
      "**/dist/",
      "**/build/",
      "**/.pnpm-store/",
      "**/.moon/",
      "**/.wrangler/",
    ],
  },
  minimal,
);

export default config;
