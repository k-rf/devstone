import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import baseConfig from "@devstone/configs-vitest/base";
import { defineConfig, mergeConfig } from "vitest/config";

const config = mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      projects: [
        {
          test: {
            name: "unit",
            include: ["src/**/*.spec.ts"],
            environment: "node",
            includeSource: ["src/**/*.ts"],
            typecheck: { enabled: true, include: ["src/**/*.spec-d.ts"] },
          },
        },
        {
          plugins: [
            cloudflareTest({
              wrangler: { configPath: "./wrangler.json" },
            }),
          ],
          test: {
            name: "e2e",
            include: ["src/e2e/**/*.e2e.spec.ts"],
          },
        },
      ],
    },
  }),
);

export default config;
