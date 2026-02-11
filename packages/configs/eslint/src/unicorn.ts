import { defineConfig } from "eslint/config";
import pluginUnicorn from "eslint-plugin-unicorn";

export const unicorn = defineConfig({
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  extends: [pluginUnicorn.configs.recommended],
});
