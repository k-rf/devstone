/**
 * `import type` 宣言を禁止し、インラインの `import { type ... }` へ統一する。
 */
export const noImportTypeDeclaration = [
  {
    selector: "ImportDeclaration[importKind='type']",
    message: "import type ... ではなく、import { type ... } を使用してください。",
  },
] as const;
