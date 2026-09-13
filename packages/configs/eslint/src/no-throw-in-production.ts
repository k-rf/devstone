import { defineConfig } from "eslint/config";

import { noThrowInProduction as noThrowInProductionRestrictedSyntax } from "./no-restricted-syntax/presets/no-throw-in-production.js";

export const noThrowInProduction = defineConfig({
  name: "devstone/no-throw-in-production",
  files: ["**/src/**/*.{ts,mts,cts,tsx}"],
  ignores: [
    "**/*.{spec,test,spec-d}.{ts,mts,cts,tsx}",
    "**/*.stories.{ts,tsx}",
    "**/test-utils/**",
    "**/tests/**",
    "**/testing/**",
  ],
  rules: {
    "no-restricted-syntax": ["error", ...noThrowInProductionRestrictedSyntax],
  },
});
