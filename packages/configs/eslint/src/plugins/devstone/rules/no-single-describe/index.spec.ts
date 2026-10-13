import { RuleTester } from "@typescript-eslint/rule-tester";

import { noSingleDescribeRule } from "./index.js";

const ruleTester = new RuleTester();
const defaultFilename = "src/example.spec.ts";

const singleDescribeCode = `
  describe("正常系", () => {
    it("テスト", () => {});
  });
`;

ruleTester.run("no-single-describe", noSingleDescribeRule, {
  valid: [
    {
      name: "テストファイル以外のファイルは検査しないこと",
      code: singleDescribeCode,
      filename: "src/example.ts",
    },
    {
      name: "describe が存在せずフラットにテストケースが記述されている場合は報告しないこと",
      code: `
        it("テスト1", () => {});
        test("テスト2", () => {});
      `,
      filename: defaultFilename,
    },
    {
      name: "describe が複数存在する場合は報告しないこと",
      code: `
        describe("正常系", () => {
          it("テスト1", () => {});
        });
        describe("異常系", () => {
          it("テスト2", () => {});
        });
      `,
      filename: defaultFilename,
    },
    {
      name: "describe がネストしている場合は報告しないこと",
      code: `
        describe("親グループ", () => {
          describe("子グループ", () => {
            it("テスト", () => {});
          });
        });
      `,
      filename: defaultFilename,
    },
    ...["beforeEach", "afterEach", "beforeAll", "afterAll"].map((hookName) => ({
      name: `単一の describe 内に ${hookName} がある場合は報告しないこと`,
      code: `
        describe("グループ", () => {
          ${hookName}(() => {});
          it("テスト", () => {});
        });
      `,
      filename: defaultFilename,
    })),
    {
      name: "describe の外側にフック関数がある場合もエラーなく処理されること",
      code: `
        beforeEach(() => {});
        it("テスト", () => {});
      `,
      filename: defaultFilename,
    },
    {
      name: "単一の describe 内にテストケースが存在しない場合は報告しないこと",
      code: `
        describe("空のグループ", () => {
          const value = 1;
        });
      `,
      filename: defaultFilename,
    },
    {
      name: "ルートが識別子でない呼び出し式があってもクラッシュせず無視されること",
      code: `
        (() => {})()();
        (1 + 1);
      `,
      filename: defaultFilename,
    },
  ],
  invalid: [
    {
      name: "単一の describe 直下に it がある場合に報告すること",
      code: `
        describe("正常系", () => {
          it("正しい引数のとき正常に終了すること", () => {});
        });
      `,
      filename: defaultFilename,
      errors: [{ messageId: "noSingleDescribe" as const }],
    },
    {
      name: "単一の describe 直下に test がある場合に報告すること",
      code: `
        describe("正常系", () => {
          test("正しい引数のとき正常に終了すること", () => {});
        });
      `,
      filename: defaultFilename,
      errors: [{ messageId: "noSingleDescribe" as const }],
    },
    {
      name: "単一の describe 内に複数のテストケースがある場合でも報告すること",
      code: `
        describe("正常系", () => {
          it("テスト1", () => {});
          it("テスト2", () => {});
        });
      `,
      filename: defaultFilename,
      errors: [{ messageId: "noSingleDescribe" as const }],
    },
    {
      name: "describe.skip や it.only などの修飾子がある場合でも検出すること",
      code: `
        describe.skip("スキップ対象", () => {
          it.only("実行対象", () => {});
        });
      `,
      filename: defaultFilename,
      errors: [{ messageId: "noSingleDescribe" as const }],
    },
    {
      name: "describe.each を用いた単一の describe を報告すること",
      code: `
        describe.each([1, 2])("パラメータ化 %i", (val) => {
          it("検証", () => {});
        });
      `,
      filename: defaultFilename,
      errors: [{ messageId: "noSingleDescribe" as const }],
    },
    {
      name: "TaggedTemplateExpression による describe.each を報告すること",
      code: `
        describe.each\`
          a | b
          \${1} | \${2}
        \`("パラメータ化", ({ a, b }) => {
          it("検証", () => {});
        });
      `,
      filename: defaultFilename,
      errors: [{ messageId: "noSingleDescribe" as const }],
    },
    {
      name: "ブロック内にネストされたテストケースがあっても単一 describe を報告すること",
      code: `
        describe("正常系", () => {
          {
            it("ネストブロック内のテスト", () => {});
          }
        });
      `,
      filename: defaultFilename,
      errors: [{ messageId: "noSingleDescribe" as const }],
    },
    ...[
      "src/example.spec.ts",
      "src/example.test.ts",
      "src/example.spec-d.ts",
      "src/example.test-d.ts",
      String.raw`C:\workspace\src\example.spec.ts`,
    ].map((filename) => ({
      name: `各種テストファイル形式で検出できること: ${filename}`,
      code: singleDescribeCode,
      filename: filename,
      errors: [{ messageId: "noSingleDescribe" as const }],
    })),
  ],
});
