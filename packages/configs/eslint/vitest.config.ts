import baseConfig from "@devstone/configs-vitest/base";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: ["src/*.ts", "src/no-restricted-syntax/**/*.ts"],
      },
    },
  }),
);
