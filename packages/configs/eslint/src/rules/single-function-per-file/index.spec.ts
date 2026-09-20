import { Linter } from "eslint";
import { parser } from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { plugin } from "../../plugin.js";

const ruleId = "devstone/single-function-per-file";
const standardFilename = "src/math.ts";
const specFilename = "src/math.spec.ts";
const testFilename = "src/math.test.ts";
const specDFilename = "src/math.spec-d.ts";
const storiesFilename = "src/button.stories.tsx";
const dtsFilename = "src/types.d.ts";

const linter = new Linter();

const config = {
  files: ["**/*.{ts,tsx}"],
  plugins: {
    devstone: plugin,
  },
  languageOptions: {
    parser: parser,
    sourceType: "module",
  },
  rules: {
    [ruleId]: "error",
  },
} satisfies Linter.Config;

const lint = (code: string, filename: string = standardFilename): readonly Linter.LintMessage[] => {
  return linter.verify(code, config, { filename: filename });
};

const singleFunctionPerFileError = (
  name: string,
): Pick<Linter.LintMessage, "message" | "messageId" | "ruleId"> => ({
  ruleId: ruleId,
  messageId: "singleFunctionPerFile",
  message: `1つのファイルに複数の主要な関数を定義することはできません（'${name}'）。単一責任の原則に従い、ファイルを分割してください。`,
});

describe("検査しない", () => {
  it.each([
    {
      name: "spec ファイルでは複数の関数を検査しないこと",
      filename: specFilename,
      code: "export const add = () => {}; export const subtract = () => {};",
    },
    {
      name: "test ファイルでは複数の関数を検査しないこと",
      filename: testFilename,
      code: "export const add = () => {}; export const subtract = () => {};",
    },
    {
      name: "spec-d ファイルでは複数の関数を検査しないこと",
      filename: specDFilename,
      code: "export const add = () => {}; export const subtract = () => {};",
    },
    {
      name: "stories ファイルでは複数の関数を検査しないこと",
      filename: storiesFilename,
      code: "export const Primary = () => {}; export const Secondary = () => {};",
    },
    {
      name: "d.ts ファイルでは複数の宣言を検査しないこと",
      filename: dtsFilename,
      code: "export declare function add(): void; export declare function subtract(): void;",
    },
    {
      name: "type-only export は検査しないこと",
      filename: standardFilename,
      code: "export type { Add, Subtract };",
    },
    {
      name: "type 宣言および interface 宣言は検査しないこと",
      filename: standardFilename,
      code: "export type Add = () => void;\nexport interface Subtract { (): void }",
    },
    {
      name: "再エクスポート（export * from '...'）は検査しないこと",
      filename: standardFilename,
      code: 'export * from "./add.js"; export * from "./subtract.js";',
    },
    {
      name: "外部モジュールからの named re-export は検査しないこと",
      filename: standardFilename,
      code: 'export { add, subtract } from "./math.js";',
    },
    {
      name: "定数のみが複数エクスポートされているファイルは検査しないこと",
      filename: standardFilename,
      code: "export const A = 1;\nexport const B = 2;\nexport const C = 'three';",
    },
    {
      name: "エラー定義クラス同士のエクスポートは検査しないこと",
      filename: standardFilename,
      code: `
        export class FirstError extends Error {}
        export class SecondError extends Data.TaggedError("SecondError")<{}> {}
      `,
    },
    {
      name: "superClass がない通常のクラス宣言が単一の場合は検査しないこと",
      filename: standardFilename,
      code: "export class StandaloneService {}",
    },
    {
      name: "関数でもクラスでもない default export は検査しないこと",
      filename: standardFilename,
      code: "export default 123;",
    },
    {
      name: "enum 宣言は検査しないこと",
      filename: standardFilename,
      code: "export enum Status { Active, Inactive }",
    },
    {
      name: "未初期化の変数宣言（let）と単一関数は検査しないこと",
      filename: standardFilename,
      code: "export let uninitializedValue;\nexport const calculate = () => 1;",
    },
    {
      name: "ローカル定義された定数の export { ... } は検査しないこと",
      filename: standardFilename,
      code: "const constantValue = 100;\nexport { constantValue };",
    },
    {
      name: "ローカル定義された非エラークラスの export { ... } を許可すること",
      filename: standardFilename,
      code: "class LocalService {}\nexport { LocalService };",
    },
    {
      name: "ローカル定義された関数宣言の export { ... } を許可すること",
      filename: standardFilename,
      code: "function localFunc() {}\nexport { localFunc };",
    },
    {
      name: "ローカル定義されたエラークラスの export { ... } は検査しないこと",
      filename: standardFilename,
      code: "class LocalError extends Error {}\nexport { LocalError };",
    },
    {
      name: "インポートされたシンボルの re-export は検査しないこと",
      filename: standardFilename,
      code: 'import { external } from "./ext.js";\nexport { external };',
    },
    {
      name: "エラークラスの default export は検査しないこと",
      filename: standardFilename,
      code: "export default class MyError extends Error {}",
    },
    {
      name: "名前付きクラスの default export を許可すること",
      filename: standardFilename,
      code: "export default class NamedService {}",
    },
    {
      name: "名前付き関数の default export を許可すること",
      filename: standardFilename,
      code: "export default function namedMain() {}",
    },
    {
      name: "文字列リテラル名の export specifier を許可すること",
      filename: standardFilename,
      code: 'const add = () => 1;\nexport { add as "add" };',
    },
    {
      name: "無名関数の default export を許可すること",
      filename: standardFilename,
      code: "export default function() {}",
    },
    {
      name: "無名クラスの default export を許可すること",
      filename: standardFilename,
      code: "export default class {}",
    },
    {
      name: "ローカル定義された型エイリアスの export { ... } は検査しないこと",
      filename: standardFilename,
      code: "type MyType = string;\nexport { MyType };",
    },
    {
      name: "配列分割代入のアロー関数 export を許可すること",
      filename: standardFilename,
      code: "export const [destructuredFn] = [() => 1];",
    },
    {
      name: "未宣言の識別子の export specifier は検査しないこと",
      filename: standardFilename,
      code: "export { undeclaredValue };",
    },
    {
      name: "同一の変数宣言内で定数と単一関数が混在する場合を許可すること",
      filename: standardFilename,
      code: "export const CONSTANT_VAL = 100, calculate = () => 1;",
    },
  ])("$name", ({ filename, code }) => {
    expect(lint(code, filename)).toEqual([]);
  });
});

describe("許可する", () => {
  it.each([
    {
      name: "単一の FunctionDeclaration を許可すること",
      code: "export function calculateTotal() { return 0; }",
    },
    {
      name: "単一のアロー関数を許可すること",
      code: "export const calculateTotal = () => 0;",
    },
    {
      name: "単一の関数式を許可すること",
      code: "export const calculateTotal = function() { return 0; };",
    },
    {
      name: "単一の ClassDeclaration を許可すること",
      code: "export class OrderProcessor {}",
    },
    {
      name: "単一の default export 関数を許可すること",
      code: "export default function calculate() {}",
    },
    {
      name: "単一の default export クラスを許可すること",
      code: "export default class CalculateService {}",
    },
    {
      name: "単一の default export アロー関数を許可すること",
      code: "export default () => 0;",
    },
    {
      name: "単一の関数と付随する単純な定数のエクスポートを許可すること",
      code: `
        export const DEFAULT_TIMEOUT = 1000;
        export const calculate = () => DEFAULT_TIMEOUT;
      `,
    },
    {
      name: "単一のクラスと付随するエラークラスのエクスポートを許可すること",
      code: `
        export class TaskBoardError extends Data.TaggedError("TaskBoardError")<{}> {}
        export class TaskBoardPort extends Context.Tag("TaskBoardPort")<TaskBoardPort, {}>() {}
      `,
    },
    {
      name: "ローカル定義された単一関数の export { foo } を許可すること",
      code: `
        const add = () => 1;
        export { add };
      `,
    },
    {
      name: "単一関数と型定義（type-only specifier）の混在を許可すること",
      code: `
        const add = () => 1;
        type Add = typeof add;
        export { add, type Add };
      `,
    },
  ])("$name", ({ code }) => {
    expect(lint(code, standardFilename)).toEqual([]);
  });
});

describe("報告する", () => {
  it.each([
    {
      name: "複数のアロー関数がエクスポートされているとき2つ目を報告すること",
      code: `
        export const add = (a: number, b: number) => a + b;
        export const subtract = (a: number, b: number) => a - b;
      `,
      expected: [singleFunctionPerFileError("subtract")],
    },
    {
      name: "複数の FunctionDeclaration がエクスポートされているとき2つ目を報告すること",
      code: `
        export function add(a: number, b: number) { return a + b; }
        export function subtract(a: number, b: number) { return a - b; }
      `,
      expected: [singleFunctionPerFileError("subtract")],
    },
    {
      name: "FunctionDeclaration とアロー関数が混在するとき2つ目を報告すること",
      code: `
        export function add(a: number, b: number) { return a + b; }
        export const multiply = (a: number, b: number) => a * b;
      `,
      expected: [singleFunctionPerFileError("multiply")],
    },
    {
      name: "default export 関数と named export 関数が混在するとき2つ目を報告すること",
      code: `
        export default function main() {}
        export const helper = () => {};
      `,
      expected: [singleFunctionPerFileError("helper")],
    },
    {
      name: "複数の ClassDeclaration がエクスポートされているとき2つ目を報告すること",
      code: `
        export class UserService {}
        export class OrderService {}
      `,
      expected: [singleFunctionPerFileError("OrderService")],
    },
    {
      name: "同一の VariableDeclaration 内で複数の関数が宣言されているとき2つ目を報告すること",
      code: "export const add = () => 1, subtract = () => 2;",
      expected: [singleFunctionPerFileError("subtract")],
    },
    {
      name: "ローカル定義された複数の関数を export { a, b } でエクスポートするとき2つ目を報告すること",
      code: `
        const add = () => 1;
        const subtract = () => 2;
        export { add, subtract };
      `,
      expected: [singleFunctionPerFileError("subtract")],
    },
    {
      name: "3つ以上の関数がエクスポートされているとき2つ目以降のすべてを報告すること",
      code: `
        export const first = () => 1;
        export const second = () => 2;
        export const third = () => 3;
      `,
      expected: [singleFunctionPerFileError("second"), singleFunctionPerFileError("third")],
    },
  ])("$name", ({ code, expected }) => {
    expect(lint(code, standardFilename)).toMatchObject(expected);
  });
});
