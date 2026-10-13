import baseConfig from "@devstone/configs-vitest/base";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      globals: true,
      coverage: {
        exclude: [
          "src/*.ts",
          "src/selectors/**/*.ts",
          "src/plugins/devstone/*.ts",
          "src/plugins/devstone/configs/**/*.ts",
        ],
      },
    },
  }),
);
