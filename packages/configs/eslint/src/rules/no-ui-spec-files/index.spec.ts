import { RuleTester } from "@typescript-eslint/rule-tester";

import { noUiSpecFilesRule } from "./index.js";

const ruleTester = new RuleTester();

ruleTester.run("no-ui-spec-files", noUiSpecFilesRule, {
  valid: [
    {
      name: "対象外の拡張子である spec.ts ファイルを許可すること",
      code: "export {};",
      filename: "apps/easel/src/button.spec.ts",
    },
    {
      name: "対象外の命名である test.tsx ファイルを許可すること",
      code: "export {};",
      filename: "apps/easel/src/button.test.tsx",
    },
    {
      name: "design-system 配下の spec.tsx ファイルを許可すること",
      code: "export {};",
      filename: "packages/design-system/src/button.spec.tsx",
    },
    {
      name: "integration ディレクトリ配下の spec.tsx ファイルを許可すること",
      code: "export {};",
      filename: "apps/easel/src/integration/button.spec.tsx",
    },
    {
      name: "e2e ディレクトリ配下の spec.jsx ファイルを許可すること",
      code: "export {};",
      filename: "apps/easel/src/e2e/button.spec.jsx",
    },
    {
      name: "end-to-end ディレクトリ配下の spec.tsx ファイルを許可すること",
      code: "export {};",
      filename: "apps/easel/src/end-to-end/button.spec.tsx",
    },
    {
      name: "Windows 形式の design-system パスを正規化して許可すること",
      code: "export {};",
      filename: String.raw`C:\workspace\packages\design-system\src\button.spec.tsx`,
    },
  ],
  invalid: [
    {
      name: "通常のアプリケーション配下にある spec.tsx ファイルを報告すること",
      code: "export {};",
      filename: "apps/easel/src/button.spec.tsx",
      errors: [{ messageId: "noUiSpecFiles" }],
    },
    {
      name: "通常のアプリケーション配下にある spec.jsx ファイルを報告すること",
      code: "export {};",
      filename: "apps/easel/src/button.spec.jsx",
      errors: [{ messageId: "noUiSpecFiles" }],
    },
  ],
});
