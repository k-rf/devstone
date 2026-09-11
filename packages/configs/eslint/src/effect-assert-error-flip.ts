import { defineConfig } from "eslint/config";

import { effectAssertErrorFlip as effectAssertErrorFlipRestrictedSyntax } from "./no-restricted-syntax/presets/effect-assert-error-flip.js";

export const effectAssertErrorFlip = defineConfig({
  name: "devstone/effect-assert-error-flip",
  files: ["**/*.{spec,test}.{ts,mts,cts,tsx}"],
  rules: {
    "no-restricted-syntax": ["error", ...effectAssertErrorFlipRestrictedSyntax],
  },
});
