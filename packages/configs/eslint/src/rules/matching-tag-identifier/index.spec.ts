import { RuleTester } from "@typescript-eslint/rule-tester";

import { matchingTagIdentifierRule } from "./index.js";

const ruleTester = new RuleTester();

ruleTester.run("matching-tag-identifier", matchingTagIdentifierRule, {
  valid: [
    {
      name: "Context.Tag を継承したクラス宣言で名前が一致しているとき許可すること",
      code: 'export class TaskBoardPort extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {}',
    },
    {
      name: "複数型引数を持つ Context.Tag で名前が一致しているとき許可すること",
      code: 'export class TaskBoardPort extends Context.Tag("TaskBoardPort")<TaskBoardPort, { readonly a: number }>() {}',
    },
    {
      name: "Data.TaggedError を継承したクラス宣言で名前が一致しているとき許可すること",
      code: 'export class TaskBoardError extends Data.TaggedError("TaskBoardError")<{ readonly message: string }> {}',
    },
    {
      name: "型引数なしの Data.TaggedError で名前が一致しているとき許可すること",
      code: 'export class TaskBoardError extends Data.TaggedError("TaskBoardError") {}',
    },
    {
      name: "名前付きクラス式で名前が一致しているとき許可すること",
      code: 'const X = class TaskBoardPort extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {};',
    },
    {
      name: "変数代入の無名クラス式で変数名と識別子が一致しているとき許可すること",
      code: 'export const TaskBoardPort = class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {};',
    },
    {
      name: "let による変数代入の無名クラス式で名前が一致しているとき許可すること",
      code: 'let TaskBoardPort = class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {};',
    },
    {
      name: "代入式による無名クラス式で左辺識別子と一致しているとき許可すること",
      code: 'TaskBoardPort = class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {};',
    },
    {
      name: "オブジェクトプロパティの無名クラス式で識別子が一致しているとき許可すること",
      code: 'const ports = { TaskBoardPort: class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {} };',
    },
    {
      name: "文字列リテラルキーのオブジェクトプロパティで識別子が一致しているとき許可すること",
      code: 'const ports = { "TaskBoardPort": class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {} };',
    },
    {
      name: "as any 型アサーションでラップされた Context.Tag で名前が一致しているとき許可すること",
      code: 'export class TaskBoardPort extends (Context.Tag("TaskBoardPort")<TaskBoardPort>() as any) {}',
    },
    {
      name: "TSTypeAssertion (<any>...) でラップされた Context.Tag で名前が一致しているとき許可すること",
      code: 'export class TaskBoardPort extends (<any>Context.Tag("TaskBoardPort")<TaskBoardPort>()) {}',
    },
    {
      name: "TSNonNullExpression (!) でラップされた Context.Tag で名前が一致しているとき許可すること",
      code: 'export class TaskBoardPort extends (Context.Tag("TaskBoardPort")<TaskBoardPort>()!) {}',
    },
    {
      name: "クラス式自体が型アサーションでラップされていても変数名を解決できること",
      code: 'const TaskBoardPort = (class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {}) as any;',
    },
    {
      name: "式の無いテンプレートリテラルで指定されていても名前が一致していれば許可すること",
      code: "export class TaskBoardPort extends Context.Tag(`TaskBoardPort`)<TaskBoardPort>() {}",
    },

    {
      name: "通常のクラス定義は検査対象外とすること",
      code: "export class NormalClass {}",
    },
    {
      name: "通常の継承クラス定義は検査対象外とすること",
      code: "class BaseClass {}\nexport class ChildClass extends BaseClass {}",
    },
    {
      name: "標準 Error を継承したクラスは検査対象外とすること",
      code: "export class CustomError extends Error {}",
    },
    {
      name: "CallExpression 以外のノードを継承するクラスは検査対象外とすること",
      code: "const Base = null;\nexport class CustomClass extends Base {}",
    },
    {
      name: "Context 以外のオブジェクトのメソッド呼び出しを継承する場合は検査対象外とすること",
      code: "export class CustomClass extends Other.Factory()<CustomClass>() {}",
    },
    {
      name: "Data の別メソッド呼び出しを継承する場合は検査対象外とすること",
      code: "export class CustomClass extends Data.OtherMethod()<CustomClass>() {}",
    },
    {
      name: "Context の別メソッド呼び出しを継承する場合は検査対象外とすること",
      code: "export class CustomClass extends Context.OtherMethod()<CustomClass>() {}",
    },
  ],
  invalid: [
    {
      name: "Context.Tag の識別子がクラス名と異なる場合はエラーを報告すること",
      code: 'export class TaskBoardPort extends Context.Tag("NotionTaskBoard")<TaskBoardPort>() {}',
      errors: [
        {
          messageId: "mismatchedIdentifier" as const,
          data: {
            calleeName: "Context.Tag",
            tagIdentifier: "NotionTaskBoard",
            className: "TaskBoardPort",
          },
        },
      ],
    },
    {
      name: "Data.TaggedError の識別子がクラス名と異なる場合はエラーを報告すること",
      code: 'export class TaskBoardError extends Data.TaggedError("DifferentError")<{}> {}',
      errors: [
        {
          messageId: "mismatchedIdentifier" as const,
          data: {
            calleeName: "Data.TaggedError",
            tagIdentifier: "DifferentError",
            className: "TaskBoardError",
          },
        },
      ],
    },
    {
      name: "変数代入クラス式で識別子が変数名と異なる場合はエラーを報告すること",
      code: 'const TaskBoardPort = class extends Context.Tag("NotionTaskBoard")<TaskBoardPort>() {};',
      errors: [
        {
          messageId: "mismatchedIdentifier" as const,
          data: {
            calleeName: "Context.Tag",
            tagIdentifier: "NotionTaskBoard",
            className: "TaskBoardPort",
          },
        },
      ],
    },
    ...[
      {
        name: "export default の無名クラス宣言で Context.Tag を継承した場合はエラーを報告すること",
        code: 'export default class extends Context.Tag("TaskBoardPort")<TaskBoardPort>() {}',
        calleeName: "Context.Tag",
      },
      {
        name: "配列リテラル内の無名クラス式で Data.TaggedError を継承した場合はエラーを報告すること",
        code: 'const list = [class extends Data.TaggedError("TaskBoardError")<{}> {}];',
        calleeName: "Data.TaggedError",
      },
      {
        name: "配列パターンへの分割代入ではクラス名を解決できないためエラーを報告すること",
        code: 'const [Port] = [class extends Context.Tag("Port")<Port>() {}];',
        calleeName: "Context.Tag",
      },
      {
        name: "変数宣言のオブジェクトパターン分割代入の右辺ではクラス名を解決できないためエラーを報告すること",
        code: 'const { Port } = class extends Context.Tag("Port")<Port>() {};',
        calleeName: "Context.Tag",
      },
      {
        name: "計算プロパティキーではクラス名を解決できないためエラーを報告すること",
        code: 'const obj = { [key]: class extends Context.Tag("Port")<Port>() {} };',
        calleeName: "Context.Tag",
      },
      {
        name: "数値キーのオブジェクトプロパティではクラス名を解決できないためエラーを報告すること",
        code: 'const obj = { 123: class extends Context.Tag("Port")<Port>() {} };',
        calleeName: "Context.Tag",
      },
      {
        name: "式文内のクラス式ではクラス名を解決できないためエラーを報告すること",
        code: '(class extends Context.Tag("Port")<Port>() {});',
        calleeName: "Context.Tag",
      },
    ].map(({ name, code, calleeName }) => ({
      name: name,
      code: code,
      errors: [{ messageId: "anonymousClass" as const, data: { calleeName: calleeName } }],
    })),
    ...[
      {
        name: "引数が存在しない場合はエラーを報告すること",
        code: "export class TaskBoardPort extends Context.Tag()<TaskBoardPort>() {}",
      },
      {
        name: "引数が文字列リテラルではなく変数である場合はエラーを報告すること",
        code: 'const tag = "TaskBoardPort";\nexport class TaskBoardPort extends Context.Tag(tag)<TaskBoardPort>() {}',
      },
      {
        name: "引数が式を含むテンプレートリテラルの場合はエラーを報告すること",
        code: 'export class TaskBoardPort extends Context.Tag(`${"TaskBoardPort"}`)<TaskBoardPort>() {}',
      },
    ].map(({ name, code }) => ({
      name: name,
      code: code,
      errors: [
        {
          messageId: "invalidIdentifier" as const,
          data: { calleeName: "Context.Tag", className: "TaskBoardPort" },
        },
      ],
    })),
  ],
});
