import { defineConfig } from "eslint/config";
import { parser } from "typescript-eslint";

export const minimal = defineConfig({
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  languageOptions: {
    parser: parser,
  },
});
