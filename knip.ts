import { type KnipConfig } from "knip";

const config: KnipConfig = {
  ignoreBinaries: ["moon", "op"],
  ignoreDependencies: ["commitlint", "lint-staged", "nyc"],
  workspaces: {
    ".": {},
    "apps/*": {
      entry: ["scripts/*.ts"],
      project: ["src/**/*.ts"],
    },
    "packages/libs/*": {
      entry: ["src/**/*.spec-d.ts"],
      project: ["src/**/*.ts"],
    },
    "packages/configs/commitlint": {
      entry: ["src/commitlint.config.ts"],
      project: ["src/**/*.ts"],
    },
    "packages/configs/vitest": {
      entry: ["src/scripts/*.ts"],
      project: ["src/**/*.ts"],
    },
    "packages/configs/eslint": {
      project: ["src/**/*.ts"],
    },
    "packages/configs/*": {},
    "packages/plugins/*": {},
  },
};

export default config;
