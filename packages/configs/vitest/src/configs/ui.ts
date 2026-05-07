import { defineConfig, mergeConfig } from "vitest/config";

import baseConfig from "./base.js";

const config = mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: "happy-dom",
    },
  }),
);

export default config;
