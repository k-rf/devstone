import { defineConfig } from "eslint/config";

import { noAsUnknownAs } from "../../../selectors/no-as-unknown-as.js";
import { noCloudflareStorageTypes } from "../../../selectors/no-cloudflare-storage-types.js";
import { noConditionalStatements } from "../../../selectors/no-conditional-statements.js";
import { noDescribeIdentifierName } from "../../../selectors/no-describe-identifier-name.js";
import { noEffectAssertExit } from "../../../selectors/no-effect-assert-exit.js";
import { noImportTypeDeclaration } from "../../../selectors/no-import-type-declaration.js";
import { noMathRandom } from "../../../selectors/no-math-random.js";
import { noNondeterministicDate } from "../../../selectors/no-nondeterministic-date.js";
import { noThrowInProduction as noThrowInProductionSelector } from "../../../selectors/no-throw-in-production.js";

const commonSyntaxSelectors = [
  ...noAsUnknownAs,
  ...noDescribeIdentifierName,
  ...noImportTypeDeclaration,
] as const;

/**
 * Devstone 固有ルールの推奨設定セット。
 */
export const recommended = defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      "devstone/single-function-per-file": "error",
      "devstone/matching-tag-identifier": "error",
      "no-restricted-syntax": ["error", ...commonSyntaxSelectors],
    },
  },
  {
    files: ["**/src/**/*.{ts,mts,cts,tsx}"],
    ignores: [
      "**/*.{spec,test,spec-d}.{ts,mts,cts,tsx}",
      "**/*.stories.{ts,tsx}",
      "**/test-utils/**",
      "**/tests/**",
      "**/testing/**",
    ],
    rules: {
      "no-restricted-syntax": ["error", ...commonSyntaxSelectors, ...noThrowInProductionSelector],
    },
  },
  {
    files: ["**/*.{spec,test,spec-d,test-d}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    rules: {
      "devstone/no-single-describe": "error",
      "devstone/test-descriptions-japanese": "error",
      "no-restricted-syntax": ["error", ...commonSyntaxSelectors, ...noEffectAssertExit],
    },
  },
  {
    files: ["**/*.{spec,test}.{jsx,tsx}"],
    rules: {
      "devstone/no-ui-spec-files": "error",
    },
  },
  {
    files: ["**/src/adapter/inbound/**/*.ts"],
    ignores: ["**/*.{spec,test}.ts", "**/*.middleware.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...commonSyntaxSelectors,
        ...noThrowInProductionSelector,
        ...noConditionalStatements,
      ],
    },
  },
  {
    files: ["**/src/core/**/*.{ts,mts,cts,tsx}"],
    ignores: [
      "**/*.{spec,test,spec-d}.{ts,mts,cts,tsx}",
      "**/*.stories.{ts,tsx}",
      "**/test-utils/**",
      "**/tests/**",
      "**/testing/**",
    ],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message:
            "Core層で fetch を直接使わないでください。Outbound Port 経由で呼び出してください。",
        },
      ],
      "no-restricted-syntax": [
        "error",
        ...commonSyntaxSelectors,
        ...noThrowInProductionSelector,
        ...noMathRandom,
        ...noNondeterministicDate,
        ...noCloudflareStorageTypes,
      ],
    },
  },
  {
    files: ["**/*.workflow.ts", "**/*.activity.ts", "**/*.workflow.tsx", "**/*.activity.tsx"],
    rules: {
      "devstone/export-role-suffixes": "error",
    },
  },
  {
    files: [
      "**/core/port/outbound/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/adapter/outbound/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    rules: {
      "devstone/outbound-partitioning": "error",
    },
  },
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    rules: {
      "devstone/path-naming-conventions": "error",
      "devstone/port-and-adapter-suffix-boundaries": "error",
    },
  },
]);
