import { defineConfig } from "eslint/config";

import { noCoreSideEffects as noCoreSideEffectsRestrictedSyntax } from "./no-restricted-syntax/presets/no-core-side-effects.js";

export const noCoreSideEffects = defineConfig({
  name: "devstone/no-core-side-effects",
  files: ["**/src/core/**/*.{ts,mts,cts,tsx}"],
  rules: {
    "no-restricted-globals": [
      "error",
      {
        name: "fetch",
        message:
          "Core層で fetch を直接使わないでください。Outbound Port 経由で呼び出してください。",
      },
    ],
    "no-restricted-syntax": ["error", ...noCoreSideEffectsRestrictedSyntax],
  },
});
