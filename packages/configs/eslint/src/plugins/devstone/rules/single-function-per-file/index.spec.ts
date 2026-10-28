import { RuleTester } from "@typescript-eslint/rule-tester";

import { singleFunctionPerFileRule } from "./index.js";

const standardFilename = "src/math.ts";
const specFilename = "src/math.spec.ts";
const testFilename = "src/math.test.ts";
const specDFilename = "src/math.spec-d.ts";
const storiesFilename = "src/button.stories.tsx";
const dtsFilename = "src/types.d.ts";

const ruleTester = new RuleTester();

const singleFunctionPerFileError = (
  name: string,
): { readonly messageId: "singleFunctionPerFile"; readonly data: Record<string, string> } => ({
  messageId: "singleFunctionPerFile" as const,
  data: { name: name },
});

ruleTester.run("single-function-per-file", singleFunctionPerFileRule, {
  valid: [
    ...[
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
        code: "export type { Add, Subtract };",
      },
      {
        name: "type 宣言および interface 宣言は検査しないこと",
        code: "export type Add = () => void;\nexport interface Subtract { (): void }",
      },
      {
        name: "interface の default export は検査しないこと",
        code: "export default interface Config {}\nexport const loadConfig = (): Config => ({});",
      },
      {
        name: "再エクスポート（export * from '...'）は検査しないこと",
        code: 'export * from "./add.js"; export * from "./subtract.js";',
      },
      {
        name: "外部モジュールからの named re-export は検査しないこと",
        code: 'export { add, subtract } from "./math.js";',
      },
      {
        name: "インポートされたシンボルの re-export は検査しないこと",
        code: 'import { external } from "./ext.js";\nexport { external };',
      },
      {
        name: "エラー定義クラス同士のエクスポートは検査しないこと",
        code: `
        export class FirstError extends Error {}
        export class SecondError extends Data.TaggedError("SecondError")<{}> {}
      `,
      },
      {
        name: "ローカル定義されたエラークラスの export { ... } は検査しないこと",
        code: "class LocalError extends Error {}\nexport { LocalError };",
      },
      {
        name: "エラークラスの default export は検査しないこと",
        code: "export default class MyError extends Error {}",
      },
      {
        name: "unique symbol 型注釈を持つ定数のエクスポートは検査しないこと",
        code: `
        export const FirstBrand: unique symbol = Symbol.for("FirstBrand");
        export const SecondBrand: unique symbol = Symbol.for("SecondBrand");
      `,
      },
      {
        name: "ローカル定義された unique symbol 型定数の export { ... } は検査しないこと",
        code: 'const LocalBrand: unique symbol = Symbol.for("LocalBrand");\nexport { LocalBrand };',
      },
      {
        name: "enum 宣言は検査しないこと",
        code: "export enum Status { Active, Inactive }",
      },
      {
        name: "ローカル定義された型エイリアスの export { ... } は検査しないこと",
        code: "type MyType = string;\nexport { MyType };",
      },
      {
        name: "未宣言の識別子の export specifier は検査しないこと",
        code: "export { undeclaredValue };",
      },
    ].map(({ name, filename = standardFilename, code }) => ({
      name: name,
      filename: filename,
      code: code,
    })),
    ...[
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
        name: "単一の定数宣言を許可すること",
        code: "export const DEFAULT_TIMEOUT = 1000;",
      },
      {
        name: "単一の未初期化変数（let）のエクスポートを許可すること",
        code: "export let uninitializedValue;",
      },
      {
        name: "コンパニオンオブジェクトパターン（1つの export const + export type）を許可すること",
        code: `
        export const SessionStats = Schema.Struct({});
        export type SessionStats = typeof SessionStats.Type;
      `,
      },
      {
        name: "Branded Schema パターン（unique symbol + Schema 定数 + 型定義）を許可すること",
        code: `
        export const NodeIdBrand: unique symbol = Symbol.for("NodeIdBrand");
        export const NodeId = Schema.String.pipe(Schema.brand(NodeIdBrand));
        export type NodeId = typeof NodeId.Type;
      `,
      },
      {
        name: "単一の ClassDeclaration を許可すること",
        code: "export class OrderProcessor {}",
      },
      {
        name: "単一の通常のクラス宣言（superClass なし）を許可すること",
        code: "export class StandaloneService {}",
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
        name: "単一の非関数・非クラスの default export を許可すること",
        code: "export default 123;",
      },
      {
        name: "名前付きクラスの default export を許可すること",
        code: "export default class NamedService {}",
      },
      {
        name: "名前付き関数の default export を許可すること",
        code: "export default function namedMain() {}",
      },
      {
        name: "無名関数の default export を許可すること",
        code: "export default function() {}",
      },
      {
        name: "無名クラスの default export を許可すること",
        code: "export default class {}",
      },
      {
        name: "ローカル定義された単一関数の export { foo } を許可すること",
        code: `
        const add = () => 1;
        export { add };
      `,
      },
      {
        name: "ローカル定義された単一定数の export { ... } を許可すること",
        code: "const constantValue = 100;\nexport { constantValue };",
      },
      {
        name: "ローカル定義された関数宣言の export { ... } を許可すること",
        code: "function localFunc() {}\nexport { localFunc };",
      },
      {
        name: "ローカル定義された非エラークラスの export { ... } を許可すること",
        code: "class LocalService {}\nexport { LocalService };",
      },
      {
        name: "文字列リテラル名の export specifier を許可すること",
        code: 'const add = () => 1;\nexport { add as "add" };',
      },
      {
        name: "配列分割代入のアロー関数 export を許可すること",
        code: "export const [destructuredFn] = [() => 1];",
      },
      {
        name: "単一のクラスと付随するエラークラスのエクスポートを許可すること",
        code: `
        export class TaskBoardError extends Data.TaggedError("TaskBoardError")<{}> {}
        export class TaskBoardPort extends Context.Tag("TaskBoardPort")<TaskBoardPort, {}>() {}
      `,
      },
      {
        name: "単一の定数と付随するエラークラスのエクスポートを許可すること",
        code: `
        export class ParseError extends Error {}
        export const SessionStats = Schema.Struct({});
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
    ].map(({ name, code }) => ({ name: name, filename: standardFilename, code: code })),
  ],
  invalid: [
    ...[
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
        name: "非関数の default export と定数の named export が混在するとき2つ目を報告すること",
        code: `
        export default 123;
        export const CONSTANT_VAL = 456;
      `,
        expected: [singleFunctionPerFileError("CONSTANT_VAL")],
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
        name: "複数の定数がエクスポートされているとき2つ目以降を報告すること",
        code: `
        export const ToolCallEntry = Schema.Struct({});
        export const SessionStats = Schema.Struct({});
      `,
        expected: [singleFunctionPerFileError("SessionStats")],
      },
      {
        name: "定数と関数が混在するとき2つ目を報告すること",
        code: `
        export const fileOption = Options.file("file");
        export const provideCanvasRepository = (filePath: string) => filePath;
      `,
        expected: [singleFunctionPerFileError("provideCanvasRepository")],
      },
      {
        name: "未初期化変数（let）と関数が混在するとき2つ目を報告すること",
        code: "export let uninitializedValue;\nexport const calculate = () => 1;",
        expected: [singleFunctionPerFileError("calculate")],
      },
      {
        name: "定数とクラス（非エラークラス）が混在するとき2つ目を報告すること",
        code: `
        export const DEFAULT_CONFIG = {};
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
        name: "同一の VariableDeclaration 内で定数と関数が混在するとき2つ目を報告すること",
        code: "export const CONSTANT_VAL = 100, calculate = () => 1;",
        expected: [singleFunctionPerFileError("calculate")],
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
        name: "ローカル定義された複数の定数を export { a, b } でエクスポートするとき2つ目を報告すること",
        code: `
        const firstValue = 1;
        const secondValue = 2;
        export { firstValue, secondValue };
      `,
        expected: [singleFunctionPerFileError("secondValue")],
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
    ].map(({ name, code, expected }) => ({
      name: name,
      filename: standardFilename,
      code: code,
      errors: expected,
    })),
  ],
});
