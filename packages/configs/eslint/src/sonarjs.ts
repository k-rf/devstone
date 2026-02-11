import { defineConfig } from "eslint/config";
import { configs } from "eslint-plugin-sonarjs";

export const sonarjs = defineConfig({
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  extends: [configs.recommended],
});
