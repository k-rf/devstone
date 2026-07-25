export const noImportTypeDeclaration = [
  {
    selector: "ImportDeclaration[importKind='type']",
    message: "import type ... ではなく、import { type ... } を使用してください。",
  },
] as const;
