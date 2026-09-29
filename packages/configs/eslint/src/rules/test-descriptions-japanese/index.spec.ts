import { Linter } from "eslint";
import { parser } from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { plugin } from "../../plugin.js";

const ruleId = "devstone/test-descriptions-japanese";
const testFilename = "src/example.spec.ts";

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
    "devstone/test-descriptions-japanese": "error",
  },
} satisfies Linter.Config;

const lint = (code: string): readonly Linter.LintMessage[] => {
  return linter.verify(code, config, { filename: testFilename });
};

describe("許可する", () => {
  it.each([
    {
      name: "it に日本語の説明文があること",
      code: 'it("正しいエッジデータを渡した場合、エッジが正常に追加され、そのIDが返されること", () => {});',
    },
    {
      name: "test に日本語の説明文があること",
      code: 'test("正しいエッジデータを渡した場合、エッジが正常に追加され、そのIDが返されること", () => {});',
    },
    {
      name: "it.skip に日本語の説明文があること",
      code: 'it.skip("スキップされるテスト", () => {});',
    },
    {
      name: "it.only に日本語の説明文があること",
      code: 'it.only("単独実行されるテスト", () => {});',
    },
    {
      name: "it.todo に日本語の説明文があること",
      code: 'it.todo("TODO テスト");',
    },
    {
      name: "it.fails に日本語の説明文があること",
      code: 'it.fails("失敗を期待するテスト", () => {});',
    },
    {
      name: "it.concurrent に日本語の説明文があること",
      code: 'it.concurrent("並行実行テスト", () => {});',
    },
    {
      name: "it.concurrent.skip に日本語の説明文があること",
      code: 'it.concurrent.skip("並行スキップテスト", () => {});',
    },
    {
      name: "it.each に日本語の説明文があること",
      code: 'it.each([1, 2])("%s 番目のテスト", () => {});',
    },
    {
      name: "it.each のタグ付きテンプレートに日本語の説明文があること",
      code: 'it.each`\n  a | b\n  1 | 2\n`("%s 番目のテスト", () => {});',
    },
    {
      name: "it.each で $name 形式のプレースホルダーを使い、テーブル要素の name が日本語であること",
      code: 'it.each([{ name: "日本語のテスト" }])("$name", () => {});',
    },
    {
      name: "it.each でキーがリテラル形式の場合に日本語の説明文があること",
      code: 'it.each([{ "name": "日本語のテスト" }])("$name", () => {});',
    },
    {
      name: "it.each のテーブルが変数で渡されている場合は静的解析不能として許可すること",
      code: 'const cases = [{ name: "foo" }]; it.each(cases)("$name", () => {});',
    },
    {
      name: "it.each のテーブルが空配列の場合は許可すること",
      code: 'it.each([])("$name", () => {});',
    },
    {
      name: "it.each のプロパティ値が変数で渡されている場合は静的解析不能として許可すること",
      code: 'const dynamicName = "foo"; it.each([{ name: dynamicName }])("$name", () => {});',
    },
    {
      name: "テンプレートリテラルに日本語が含まれていること",
      code: "it(`ID: ${id} が正常に更新されること`, () => {});",
    },
    {
      name: "変数で渡された説明文は静的に検証できないため無視すること",
      code: 'const testName = "should pass"; it(testName, () => {});',
    },
    {
      name: "computed member expression（it['skip']）で日本語の説明文があること",
      code: 'it["skip"]("日本語テスト", () => {});',
    },
    {
      name: "即時関数実行の呼び出しは検査対象外であること",
      code: '(function() {})("test");',
    },
    {
      name: "describe の説明文は検査対象外であること",
      code: 'describe("English test suite", () => {});',
    },
    {
      name: "一般の関数呼び出しは検査対象外であること",
      code: 'customAssert("English message");',
    },
  ])("$name を許可すること", ({ code }) => {
    expect(lint(code)).toEqual([]);
  });
});

describe("報告する", () => {
  it.each([
    {
      name: "it の説明文が英語のみの場合",
      code: 'it("should return the added edge ID when valid data is provided", () => {});',
    },
    {
      name: "test の説明文が英語のみの場合",
      code: 'test("should return the added edge ID when valid data is provided", () => {});',
    },
    {
      name: "it.skip の説明文が英語のみの場合",
      code: 'it.skip("should skip this test", () => {});',
    },
    {
      name: "it.only の説明文が英語のみの場合",
      code: 'it.only("should run only this test", () => {});',
    },
    {
      name: "it.todo の説明文が英語のみの場合",
      code: 'it.todo("should implement later");',
    },
    {
      name: "it.fails の説明文が英語のみの場合",
      code: 'it.fails("should fail", () => {});',
    },
    {
      name: "it.concurrent の説明文が英語のみの場合",
      code: 'it.concurrent("should run concurrently", () => {});',
    },
    {
      name: "it.concurrent.skip の説明文が英語のみの場合",
      code: 'it.concurrent.skip("should skip concurrently", () => {});',
    },
    {
      name: "it.each の説明文が英語のみの場合",
      code: 'it.each([1, 2])("should test item %s", () => {});',
    },
    {
      name: "it.each で $name 形式を使い、テーブル要素の name が英語のみの場合",
      code: 'it.each([{ name: "English test only" }])("$name", () => {});',
    },
    {
      name: "it.each で $name 形式を使い、テーブル要素がオブジェクトでない場合",
      code: 'it.each(["invalid"])("$name", () => {});',
    },
    {
      name: "it.each で $name 形式を使い、該当プロパティが存在しない場合",
      code: 'it.each([{}])("$name", () => {});',
    },
    {
      name: "it.each で $name 形式を使い、要素が SpreadElement のみで対象プロパティが存在しない場合",
      code: 'const baseCase = {}; it.each([{ ...baseCase }])("$name", () => {});',
    },
    {
      name: "it.each で引数なしで $name 形式を使った場合",
      code: 'it.each()("$name", () => {});',
    },
    {
      name: "it.skip で $name 形式を使った場合（テーブルが存在しないため報告）",
      code: 'it.skip("$name", () => {});',
    },
    {
      name: "テンプレートリテラルの説明文が英語のみの場合",
      code: "it(`should test with ${id}`, () => {});",
    },
    {
      name: "説明文が空文字の場合",
      code: 'it("", () => {});',
    },
    {
      name: "説明文が数字や記号のみの場合",
      code: 'it("12345 !@#$", () => {});',
    },
    {
      name: "第1引数が指定されていない場合",
      code: "it();",
    },
    {
      name: "第1引数が数値リテラルの場合",
      code: "it(123, () => {});",
    },
  ])("$name を報告すること", ({ code }) => {
    const messages = lint(code);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      ruleId: ruleId,
      messageId: "requireJapaneseDescription",
      message: "テスト名には日本語（ひらがな、カタカナ、漢字）を含める必要があります。",
    });
  });
});
