import { Linter } from "eslint";
import { parser } from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { plugin } from "../../plugin.js";

const ruleId = "devstone/export-role-suffixes";
const workflowFilename = "src/create-item.workflow.ts";
const activityFilename = "src/create-item.activity.ts";
const unscopedFilename = "src/create-item.ts";
const workflowSpecFilename = "src/create-item.workflow.spec.ts";

const linter = new Linter();

const config = {
  files: ["**/*.ts"],
  plugins: {
    devstone: plugin,
  },
  languageOptions: {
    parser: parser,
    sourceType: "module",
  },
  rules: {
    "devstone/export-role-suffixes": "error",
  },
} satisfies Linter.Config;

const lint = (code: string, filename: string): readonly Linter.LintMessage[] => {
  return linter.verify(code, config, { filename: filename });
};

const missingRoleSuffix = (
  name: string,
  roleSuffix: string,
): Pick<Linter.LintMessage, "message" | "messageId" | "ruleId"> => ({
  ruleId: ruleId,
  messageId: "missingRoleSuffix",
  message: `'${name}' は '${roleSuffix}' で終わる必要があります（ファイル役割: ${roleSuffix}）。`,
});

describe("検査しない", () => {
  it.each([
    {
      name: "役割サフィックスのないファイルでは named export を検査しないこと",
      filename: unscopedFilename,
      code: "export const createItem = 1;",
    },
    {
      name: "テストファイルでは named export を検査しないこと",
      filename: workflowSpecFilename,
      code: "export const createItem = 1;",
    },
    {
      name: "type-only の export type 宣言を検査しないこと",
      filename: workflowFilename,
      code: "export type CreateItem = { readonly id: string };",
    },
    {
      name: "type-only の export type { } を検査しないこと",
      filename: workflowFilename,
      code: "type CreateItem = { readonly id: string };\nexport type { CreateItem };",
    },
    {
      name: "export interface を検査しないこと",
      filename: workflowFilename,
      code: "export interface CreateItem { readonly id: string }",
    },
    {
      name: "export enum を検査しないこと",
      filename: workflowFilename,
      code: "export enum CreateItem { Ready }",
    },
    {
      name: "specifier の type-only export を検査しないこと",
      filename: workflowFilename,
      code: "const createItem = 1;\nexport { type createItem };",
    },
    {
      name: "default export は検査しないこと",
      filename: workflowFilename,
      code: "export default function createItem() {}",
    },
    {
      name: "オブジェクト分割代入の export は識別子でないため検査しないこと",
      filename: workflowFilename,
      code: "export const { createItem } = { createItem: 1 };",
    },
    {
      name: "配列分割代入の export は識別子でないため検査しないこと",
      filename: workflowFilename,
      code: "export const [createItem] = [1];",
    },
    {
      name: "文字列の export 名は検査しないこと",
      filename: workflowFilename,
      code: 'const createItem = 1;\nexport { createItem as "create-item" };',
    },
    {
      name: "export * は検査しないこと",
      filename: workflowFilename,
      code: 'export * from "./create-item.js";',
    },
    {
      name: "ファイル内の非 export 宣言は検査しないこと",
      filename: workflowFilename,
      code: "const createItem = 1;\nexport const createItemWorkflow = createItem;",
    },
    {
      name: "空の named export は検査しないこと",
      filename: workflowFilename,
      code: "export {};",
    },
  ])("$name", ({ filename, code }) => {
    expect(lint(code, filename)).toEqual([]);
  });
});

describe("許可する", () => {
  it.each([
    {
      name: "Workflow ファイルで Workflow で終わる const を許可すること",
      filename: workflowFilename,
      code: "export const createItemWorkflow = 1;",
    },
    {
      name: "Activity ファイルで Activity で終わる const を許可すること",
      filename: activityFilename,
      code: "export const createItemActivity = 1;",
    },
    {
      name: "Workflow ファイルで Workflow で終わる function を許可すること",
      filename: workflowFilename,
      code: "export function createItemWorkflow() {}",
    },
    {
      name: "Workflow ファイルで Workflow で終わる class を許可すること",
      filename: workflowFilename,
      code: "export class CreateItemWorkflow {}",
    },
    {
      name: "export { name } の exported 名が役割サフィックスで終わることを許可すること",
      filename: workflowFilename,
      code: "const createItemWorkflow = 1;\nexport { createItemWorkflow };",
    },
    {
      name: "export { local as exported } の exported 名が役割サフィックスで終わることを許可すること",
      filename: workflowFilename,
      code: "const createItem = 1;\nexport { createItem as createItemWorkflow };",
    },
    {
      name: "値と型が混在する specifier では値だけ検査し、適合していれば通すこと",
      filename: workflowFilename,
      code: "const createItemWorkflow = 1;\ntype CreateItem = string;\nexport { createItemWorkflow, type CreateItem };",
    },
    {
      name: "再エクスポートでも exported 名が役割サフィックスで終われば許可すること",
      filename: workflowFilename,
      code: 'export { createItemWorkflow } from "./create-item.js";',
    },
  ])("$name", ({ filename, code }) => {
    expect(lint(code, filename)).toEqual([]);
  });
});

describe("報告する", () => {
  it.each([
    {
      name: "Workflow ファイルの const が Workflow で終わらないとき報告すること",
      filename: workflowFilename,
      code: "export const createItem = 1;",
      expected: [missingRoleSuffix("createItem", "Workflow")],
    },
    {
      name: "Activity ファイルの const が Activity で終わらないとき報告すること",
      filename: activityFilename,
      code: "export const createItem = 1;",
      expected: [missingRoleSuffix("createItem", "Activity")],
    },
    {
      name: "function が役割サフィックスで終わらないとき報告すること",
      filename: workflowFilename,
      code: "export function createItem() {}",
      expected: [missingRoleSuffix("createItem", "Workflow")],
    },
    {
      name: "class が役割サフィックスで終わらないとき報告すること",
      filename: workflowFilename,
      code: "export class CreateItem {}",
      expected: [missingRoleSuffix("CreateItem", "Workflow")],
    },
    {
      name: "export { name } の exported 名が役割サフィックスで終わらないとき報告すること",
      filename: workflowFilename,
      code: "const createItem = 1;\nexport { createItem };",
      expected: [missingRoleSuffix("createItem", "Workflow")],
    },
    {
      name: "alias の exported 名が役割サフィックスで終わらないとき報告すること",
      filename: workflowFilename,
      code: "const createItemWorkflow = 1;\nexport { createItemWorkflow as createItem };",
      expected: [missingRoleSuffix("createItem", "Workflow")],
    },
    {
      name: "再エクスポートの exported 名が役割サフィックスで終わらないとき報告すること",
      filename: workflowFilename,
      code: 'export { createItem } from "./create-item.js";',
      expected: [missingRoleSuffix("createItem", "Workflow")],
    },
    {
      name: "複数の const のうちサフィックスがない識別子だけ報告すること",
      filename: workflowFilename,
      code: "export const createItem = 1, createItemWorkflow = 2;",
      expected: [missingRoleSuffix("createItem", "Workflow")],
    },
    {
      name: "複数の const がどちらもサフィックスを欠くときそれぞれ報告すること",
      filename: workflowFilename,
      code: "export const createItem = 1, saveItem = 2;",
      expected: [
        missingRoleSuffix("createItem", "Workflow"),
        missingRoleSuffix("saveItem", "Workflow"),
      ],
    },
    {
      name: "値と型が混在する specifier では値の名前だけ報告すること",
      filename: workflowFilename,
      code: "const createItem = 1;\ntype CreateItem = string;\nexport { createItem, type CreateItem };",
      expected: [missingRoleSuffix("createItem", "Workflow")],
    },
    {
      name: "Activity で終わる名前でも Workflow ファイルでは報告すること",
      filename: workflowFilename,
      code: "export const createItemActivity = 1;",
      expected: [missingRoleSuffix("createItemActivity", "Workflow")],
    },
    {
      name: "Workflow で終わる名前でも Activity ファイルでは報告すること",
      filename: activityFilename,
      code: "export const createItemWorkflow = 1;",
      expected: [missingRoleSuffix("createItemWorkflow", "Activity")],
    },
    {
      name: "名前の途中に役割サフィックスがあっても末尾でなければ報告すること",
      filename: workflowFilename,
      code: "export const workflowEngine = 1;",
      expected: [missingRoleSuffix("workflowEngine", "Workflow")],
    },
    {
      name: "async function が役割サフィックスで終わらないとき報告すること",
      filename: activityFilename,
      code: "export async function createItem() {}",
      expected: [missingRoleSuffix("createItem", "Activity")],
    },
  ])("$name", ({ filename, code, expected }) => {
    expect(lint(code, filename)).toMatchObject(expected);
  });
});
