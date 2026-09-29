import { Linter } from "eslint";
import { parser } from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { plugin } from "../../plugin.js";

const ruleId = "devstone/matching-tag-identifier";

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

const lint = (code: string): readonly Linter.LintMessage[] => {
  return linter.verify(code, config, { filename: "src/sample.ts" });
};

describe("正常系（タグ識別子とクラス名が一致している場合）", () => {
  it.each([
    {
      title: "Context.Tag を継承したクラス宣言で名前が一致している",
      code: 'export class TaskBoardPort extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {}',
    },
    {
      title: "複数型引数を持つ Context.Tag で名前が一致している",
      code: 'export class TaskBoardPort extends Context.Tag("TaskBoardPort")<TaskBoardPort, { readonly a: number }>() {}',
    },
    {
      title: "Data.TaggedError を継承したクラス宣言で名前が一致している",
      code: 'export class TaskBoardError extends Data.TaggedError("TaskBoardError")<{ readonly message: string }> {}',
    },
    {
      title: "型引数なしの Data.TaggedError で名前が一致している",
      code: 'export class TaskBoardError extends Data.TaggedError("TaskBoardError") {}',
    },
    {
      title: "名前付きクラス式で名前が一致している",
      code: 'const X = class TaskBoardPort extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {};',
    },
    {
      title: "変数代入の無名クラス式で変数名と識別子が一致している",
      code: 'export const TaskBoardPort = class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {};',
    },
    {
      title: "let による変数代入の無名クラス式で名前が一致している",
      code: 'let TaskBoardPort = class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {};',
    },
    {
      title: "代入式による無名クラス式で左辺識別子と一致している",
      code: 'TaskBoardPort = class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {};',
    },
    {
      title: "オブジェクトプロパティの無名クラス式で識別子が一致している",
      code: 'const ports = { TaskBoardPort: class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {} };',
    },
    {
      title: "文字列リテラルキーのオブジェクトプロパティで識別子が一致している",
      code: 'const ports = { "TaskBoardPort": class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {} };',
    },
    {
      title: "as any 型アサーションでラップされた Context.Tag で名前が一致している",
      code: 'export class TaskBoardPort extends (Context.Tag("TaskBoardPort")<TaskBoardPort>() as any) {}',
    },
    {
      title: "TSTypeAssertion (<any>...) でラップされた Context.Tag で名前が一致している",
      code: 'export class TaskBoardPort extends (<any>Context.Tag("TaskBoardPort")<TaskBoardPort>()) {}',
    },
    {
      title: "TSNonNullExpression (!) でラップされた Context.Tag で名前が一致している",
      code: 'export class TaskBoardPort extends (Context.Tag("TaskBoardPort")<TaskBoardPort>()!) {}',
    },
    {
      title: "クラス式自体が型アサーションでラップされていても変数名を解決できる",
      code: 'const TaskBoardPort = (class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {}) as any;',
    },
    {
      title: "式の無いテンプレートリテラルで指定されていても名前が一致していれば許可する",
      code: "export class TaskBoardPort extends Context.Tag(`TaskBoardPort`)<TaskBoardPort>() {}",
    },
  ])("$title", ({ code }) => {
    const messages = lint(code);
    expect(messages).toEqual([]);
  });
});

describe("検査対象外（Context.Tag または Data.TaggedError を継承していない場合）", () => {
  it.each([
    {
      title: "通常のクラス定義は検査対象外とする",
      code: "export class NormalClass {}",
    },
    {
      title: "通常の継承クラス定義は検査対象外とする",
      code: "class BaseClass {}\nexport class ChildClass extends BaseClass {}",
    },
    {
      title: "標準 Error を継承したクラスは検査対象外とする",
      code: "export class CustomError extends Error {}",
    },
    {
      title: "CallExpression 以外のノードを継承するクラスは検査対象外とする",
      code: "const Base = null;\nexport class CustomClass extends Base {}",
    },
    {
      title: "Context 以外のオブジェクトのメソッド呼び出しを継承する場合は検査対象外とする",
      code: "export class CustomClass extends Other.Factory()<CustomClass>() {}",
    },
    {
      title: "Data の別メソッド呼び出しを継承する場合は検査対象外とする",
      code: "export class CustomClass extends Data.OtherMethod()<CustomClass>() {}",
    },
    {
      title: "Context の別メソッド呼び出しを継承する場合は検査対象外とする",
      code: "export class CustomClass extends Context.OtherMethod()<CustomClass>() {}",
    },
  ])("$title", ({ code }) => {
    const messages = lint(code);
    expect(messages).toEqual([]);
  });
});

describe("異常系: クラス名とタグ識別子の不一致", () => {
  it.each([
    {
      title: "Context.Tag の識別子がクラス名と異なる場合はエラーを報告する",
      code: 'export class TaskBoardPort extends Context.Tag("NotionTaskBoard")<TaskBoardPort>() {}',
      expectedMessage:
        "Context.Tag のタグ識別子 'NotionTaskBoard' はクラス名 'TaskBoardPort' と一致していなければなりません。",
    },
    {
      title: "Data.TaggedError の識別子がクラス名と異なる場合はエラーを報告する",
      code: 'export class TaskBoardError extends Data.TaggedError("DifferentError")<{}> {}',
      expectedMessage:
        "Data.TaggedError のタグ識別子 'DifferentError' はクラス名 'TaskBoardError' と一致していなければなりません。",
    },
    {
      title: "変数代入クラス式で識別子が変数名と異なる場合はエラーを報告する",
      code: 'const TaskBoardPort = class extends Context.Tag("NotionTaskBoard")<TaskBoardPort>() {};',
      expectedMessage:
        "Context.Tag のタグ識別子 'NotionTaskBoard' はクラス名 'TaskBoardPort' と一致していなければなりません。",
    },
  ])("$title", ({ code, expectedMessage }) => {
    const messages = lint(code);

    expect(messages).toHaveLength(1);
    expect(messages[0]?.messageId).toBe("mismatchedIdentifier");
    expect(messages[0]?.message).toBe(expectedMessage);
  });
});

describe("異常系: 解決できない匿名クラスでの継承", () => {
  it.each([
    {
      title: "export default の無名クラス宣言で Context.Tag を継承した場合はエラーを報告する",
      code: 'export default class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {}',
      expectedMessage:
        "Context.Tag を継承するクラスには名前が必要です。名前を解決できない匿名クラスでの継承は禁止されています。",
    },
    {
      title: "配列リテラル内の無名クラス式で Data.TaggedError を継承した場合はエラーを報告する",
      code: 'const list = [class extends Data.TaggedError("TaskBoardError")<{}> {}];',
      expectedMessage:
        "Data.TaggedError を継承するクラスには名前が必要です。名前を解決できない匿名クラスでの継承は禁止されています。",
    },
    {
      title: "配列パターンへの分割代入ではクラス名を解決できないためエラーを報告する",
      code: 'const [Port] = [class extends Context.Tag("Port")<Port>() {}];',
      expectedMessage:
        "Context.Tag を継承するクラスには名前が必要です。名前を解決できない匿名クラスでの継承は禁止されています。",
    },
    {
      title:
        "変数宣言のオブジェクトパターン分割代入の右辺ではクラス名を解決できないためエラーを報告する",
      code: 'const { Port } = class extends Context.Tag("Port")<Port>() {};',
      expectedMessage:
        "Context.Tag を継承するクラスには名前が必要です。名前を解決できない匿名クラスでの継承は禁止されています。",
    },
    {
      title: "計算プロパティキーではクラス名を解決できないためエラーを報告する",
      code: 'const obj = { [key]: class extends Context.Tag("Port")<Port>() {} };',
      expectedMessage:
        "Context.Tag を継承するクラスには名前が必要です。名前を解決できない匿名クラスでの継承は禁止されています。",
    },
    {
      title: "数値キーのオブジェクトプロパティではクラス名を解決できないためエラーを報告する",
      code: 'const obj = { 123: class extends Context.Tag("Port")<Port>() {} };',
      expectedMessage:
        "Context.Tag を継承するクラスには名前が必要です。名前を解決できない匿名クラスでの継承は禁止されています。",
    },
    {
      title: "式文内のクラス式ではクラス名を解決できないためエラーを報告する",
      code: '(class extends Context.Tag("Port")<Port>() {});',
      expectedMessage:
        "Context.Tag を継承するクラスには名前が必要です。名前を解決できない匿名クラスでの継承は禁止されています。",
    },
  ])("$title", ({ code, expectedMessage }) => {
    const messages = lint(code);

    expect(messages).toHaveLength(1);
    expect(messages[0]?.messageId).toBe("anonymousClass");
    expect(messages[0]?.message).toBe(expectedMessage);
  });
});

describe("異常系: 無効なタグ識別子の指定", () => {
  it.each([
    {
      title: "引数が存在しない場合はエラーを報告する",
      code: "export class TaskBoardPort extends Context.Tag()<TaskBoardPort>() {}",
      expectedMessage:
        "Context.Tag の第1引数には、クラス名 'TaskBoardPort' と一致する文字列リテラルを指定してください。",
    },
    {
      title: "引数が文字列リテラルではなく変数である場合はエラーを報告する",
      code: 'const tag = "TaskBoardPort";\nexport class TaskBoardPort extends Context.Tag(tag)<TaskBoardPort>() {}',
      expectedMessage:
        "Context.Tag の第1引数には、クラス名 'TaskBoardPort' と一致する文字列リテラルを指定してください。",
    },
    {
      title: "引数が式を含むテンプレートリテラルの場合はエラーを報告する",
      code: 'export class TaskBoardPort extends Context.Tag(`${"TaskBoardPort"}`)<TaskBoardPort>() {}',
      expectedMessage:
        "Context.Tag の第1引数には、クラス名 'TaskBoardPort' と一致する文字列リテラルを指定してください。",
    },
  ])("$title", ({ code, expectedMessage }) => {
    const messages = lint(code);

    expect(messages).toHaveLength(1);
    expect(messages[0]?.messageId).toBe("invalidIdentifier");
    expect(messages[0]?.message).toBe(expectedMessage);
  });
});
