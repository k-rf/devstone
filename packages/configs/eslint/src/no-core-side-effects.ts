import { defineConfig } from "eslint/config";

import { baseRestrictedSyntaxSelectors } from "./base-restricted-syntax.js";

/**
 * Core層での副作用・非決定論的処理を禁止する設定。
 * 提案上のルール名: `devstone/no-core-side-effects`
 *
 * @see docs/eslint-rules-proposal.md
 */
const coreSideEffectSelectors = [
  {
    selector: "TSTypeReference[typeName.name=/^(KVNamespace|D1Database|R2Bucket)$/]",
    message:
      "Core層で Cloudflare ストレージ型を直接参照しないでください。Outbound Port 経由で隠蔽してください。",
  },
  {
    selector: "TSTypeReference[typeName.right.name=/^(KVNamespace|D1Database|R2Bucket)$/]",
    message:
      "Core層で Cloudflare ストレージ型を直接参照しないでください。Outbound Port 経由で隠蔽してください。",
  },
  {
    selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
    message: "Core層で Date.now() を使わないでください。Effect-TS の Clock を使用してください。",
  },
  {
    selector: "NewExpression[callee.name='Date'][arguments.length=0]",
    message:
      "Core層で引数なしの new Date() を使わないでください。Effect-TS の Clock を使用してください。",
  },
  {
    selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
    message:
      "Core層で Math.random() を使わないでください。Effect-TS の Random を使用してください。",
  },
] as const;

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
    "no-restricted-syntax": ["error", ...baseRestrictedSyntaxSelectors, ...coreSideEffectSelectors],
  },
});
