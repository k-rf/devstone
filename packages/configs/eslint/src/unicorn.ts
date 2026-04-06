import { defineConfig } from "eslint/config";
import pluginUnicorn from "eslint-plugin-unicorn";

export const unicorn = defineConfig({
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  extends: [pluginUnicorn.configs.recommended],
  rules: {
    "unicorn/prevent-abbreviations": [
      "error",
      {
        allowList: {
          args: true,
          Args: true,
          env: true,
          Env: true,
          params: true,
          Params: true,
          props: true,
          Props: true,
          req: true,
          Req: true,
          res: true,
          Res: true,
        },
        ignore: [".e2e"],
      },
    ],

    /** @remarks EffectのOption.someにて誤検知されるため無効化する */
    "unicorn/no-array-callback-reference": "off",

    /** @remarks TypeScript の必須引数として undefined を明示的に渡す場合があるため */
    "unicorn/no-useless-undefined": ["error", { checkArguments: false }],
  },
});
