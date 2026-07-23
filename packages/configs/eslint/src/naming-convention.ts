import { defineConfig } from "eslint/config";

/**
 * Schema / 境界モデル定数などの PascalCase const を許容する規則。
 */
const pascalCaseConstOption = {
  selector: "variable",
  modifiers: ["const"],
  format: ["camelCase", "UPPER_CASE", "PascalCase"],
  filter: {
    regex: "^[A-Z]",
    match: true,
  },
} as const;

const sharedIdentifierOptions = [
  {
    selector: "variable",
    format: ["camelCase", "UPPER_CASE"],
    leadingUnderscore: "allow",
    trailingUnderscore: "allow",
  },
  {
    selector: "function",
    format: ["camelCase", "PascalCase"],
  },
  {
    selector: "import",
    format: ["camelCase", "PascalCase", "UPPER_CASE"],
  },
] as const;

const sharedTypeAndPropertyOptions = [
  {
    selector: "typeLike",
    format: ["PascalCase"],
  },
  {
    selector: "typeParameter",
    format: ["PascalCase"],
  },
  // 外部 API Payload 等で snake_case を許容する
  {
    selector: "property",
    format: ["camelCase", "PascalCase", "UPPER_CASE", "snake_case"],
    leadingUnderscore: "allow",
  },
  // 引用符が必要なプロパティ（日本語キー・特殊文字など）は形式チェック対象外
  {
    selector: "property",
    modifiers: ["requiresQuotes"],
    // eslint-disable-next-line unicorn/no-null -- naming-convention で形式チェックを無効化する公式指定
    format: null,
  },
  // commitlint ルール名など kebab-case のオブジェクトメソッドを許容する
  {
    selector: "objectLiteralMethod",
    modifiers: ["requiresQuotes"],
    // eslint-disable-next-line unicorn/no-null -- naming-convention で形式チェックを無効化する公式指定
    format: null,
  },
  {
    selector: "parameter",
    format: ["camelCase"],
    leadingUnderscore: "allow",
  },
  {
    selector: "enumMember",
    format: ["PascalCase", "UPPER_CASE"],
  },
  {
    selector: "default",
    format: ["camelCase"],
    leadingUnderscore: "allow",
    trailingUnderscore: "allow",
  },
] as const;

/**
 * 共有の naming-convention ベース規則。
 * Flat Config ではルール配列がマージされず上書きされるため、
 * ディレクトリ別オーバーライドでもベース規則を再宣言する。
 *
 * セレクタは上から順に最初のマッチが適用される（default はフォールバック）。
 */
const baseNamingConventionOptions = [
  pascalCaseConstOption,
  ...sharedIdentifierOptions,
  ...sharedTypeAndPropertyOptions,
];

/**
 * アダプター本番実装向け: class に Live サフィックスを要求する。
 * Context.Tag / Config / Port / Error は実装クラスではないため除外する。
 * class セレクタは typeLike より先に置く必要がある。
 */
const adapterLiveNamingConventionOptions = [
  pascalCaseConstOption,
  ...sharedIdentifierOptions,
  {
    selector: "class",
    format: ["PascalCase"],
    suffix: ["Live"],
    filter: {
      regex: "(Config|Port|Error|Tag)$",
      match: false,
    },
  },
  ...sharedTypeAndPropertyOptions,
];

/**
 * モック・テスト用アダプター向け: class に Mock プレフィックスを要求する。
 */
const adapterMockNamingConventionOptions = [
  pascalCaseConstOption,
  ...sharedIdentifierOptions,
  {
    selector: "class",
    format: ["PascalCase"],
    suffix: ["Mock"],
  },
  ...sharedTypeAndPropertyOptions,
];

export const namingConvention = defineConfig(
  {
    files: ["**/*.{ts,mts,cts,tsx}"],
    rules: {
      "@typescript-eslint/naming-convention": ["error", ...baseNamingConventionOptions],
    },
  },
  {
    files: ["**/src/adapter/**/*.ts", "**/src/adapter/**/*.tsx"],
    ignores: ["**/*.spec.ts", "**/*.test.ts", "**/*.mock.ts", "**/mocks/**/*"],
    rules: {
      "@typescript-eslint/naming-convention": ["error", ...adapterLiveNamingConventionOptions],
    },
  },
  {
    files: [
      "**/src/adapter/**/*.mock.ts",
      "**/src/adapter/**/*.mock.tsx",
      "**/mocks/**/*.ts",
      "**/mocks/**/*.tsx",
    ],
    rules: {
      "@typescript-eslint/naming-convention": ["error", ...adapterMockNamingConventionOptions],
    },
  },
);
