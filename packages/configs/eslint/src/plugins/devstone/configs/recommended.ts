import { defineConfig } from "eslint/config";

/**
 * Devstone 固有ルールの推奨設定セット。
 */
export const recommended = defineConfig([
  {
    name: "devstone/single-function-per-file",
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      "devstone/single-function-per-file": "error",
    },
  },
  {
    name: "devstone/matching-tag-identifier",
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      "devstone/matching-tag-identifier": "error",
    },
  },
  {
    name: "devstone/no-single-describe",
    files: [
      "**/*.{spec,test}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/*.{spec-d,test-d}.{ts,mts,cts}",
    ],
    rules: {
      "devstone/no-single-describe": "error",
    },
  },
  {
    name: "devstone/no-ui-spec-files",
    files: ["**/*.{spec,test}.{jsx,tsx}"],
    rules: {
      "devstone/no-ui-spec-files": "error",
    },
  },
  {
    name: "devstone/test-descriptions-japanese",
    files: [
      "**/*.{spec,test}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/*.{spec-d,test-d}.{ts,mts,cts}",
    ],
    rules: {
      "devstone/test-descriptions-japanese": "error",
    },
  },
  {
    name: "devstone/export-role-suffixes",
    files: ["**/*.workflow.ts", "**/*.activity.ts", "**/*.workflow.tsx", "**/*.activity.tsx"],
    rules: {
      "devstone/export-role-suffixes": "error",
    },
  },
  {
    name: "devstone/outbound-partitioning",
    files: [
      "**/core/port/outbound/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/adapter/outbound/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    rules: {
      "devstone/outbound-partitioning": "error",
    },
  },
  {
    name: "devstone/path-naming-conventions",
    files: ["**/*.{ts,tsx}"],
    rules: {
      "devstone/path-naming-conventions": "error",
    },
  },
]);
