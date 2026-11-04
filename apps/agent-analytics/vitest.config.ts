import baseConfig from "@devstone/configs-vitest/base";
import { defineConfig, mergeConfig } from "vitest/config";

const config = mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: ["src/main.ts"],
      },
      silent: true,
    },
  }),
);

export default config;
