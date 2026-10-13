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
      name: "対象外の拡張子である test.ts ファイルを許可すること",
      code: "export {};",
      filename: "apps/easel/src/button.test.ts",
    },
  ],
  invalid: [
    {
      name: "spec.tsx ファイルを報告すること",
      code: "export {};",
      filename: "apps/easel/src/button.spec.tsx",
      errors: [{ messageId: "noUiSpecFiles" }],
    },
    {
      name: "spec.jsx ファイルを報告すること",
      code: "export {};",
      filename: "apps/easel/src/button.spec.jsx",
      errors: [{ messageId: "noUiSpecFiles" }],
    },
    {
      name: "test.tsx ファイルを報告すること",
      code: "export {};",
      filename: "apps/easel/src/button.test.tsx",
      errors: [{ messageId: "noUiSpecFiles" }],
    },
    {
      name: "test.jsx ファイルを報告すること",
      code: "export {};",
      filename: "apps/easel/src/button.test.jsx",
      errors: [{ messageId: "noUiSpecFiles" }],
    },
    {
      name: "Windows 形式のパスの test.tsx ファイルを報告すること",
      code: "export {};",
      filename: String.raw`C:\workspace\apps\easel\src\button.test.tsx`,
      errors: [{ messageId: "noUiSpecFiles" }],
    },
  ],
});
