import { Linter } from "eslint";
import { parser } from "typescript-eslint";
import { describe, expect, it } from "vitest";

import { plugin } from "../../plugin.js";

const ruleId = "devstone/no-single-describe";
const defaultFilename = "src/example.spec.ts";

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

const lint = (code: string, filename: string = defaultFilename): readonly Linter.LintMessage[] => {
  return linter.verify(code, config, { filename: filename });
};

const singleDescribeError = {
  ruleId: ruleId,
  messageId: "noSingleDescribe",
  message:
    "テストファイル内に単一の describe しか存在しない場合は、冗長なグループ化を省略し、テストケース（it / test）を直接記述してください。",
};

describe("検査しない", () => {
  it("テストファイル以外のファイルは検査しないこと", () => {
    const code = `
      describe("正常系", () => {
        it("テスト", () => {});
      });
    `;
    expect(lint(code, "src/example.ts")).toEqual([]);
  });

  it("describe が存在せずフラットにテストケースが記述されている場合は報告しないこと", () => {
    const code = `
      it("テスト1", () => {});
      test("テスト2", () => {});
    `;
    expect(lint(code)).toEqual([]);
  });

  it("describe が複数存在する場合は報告しないこと", () => {
    const code = `
      describe("正常系", () => {
        it("テスト1", () => {});
      });
      describe("異常系", () => {
        it("テスト2", () => {});
      });
    `;
    expect(lint(code)).toEqual([]);
  });

  it("describe がネストしている場合は報告しないこと", () => {
    const code = `
      describe("親グループ", () => {
        describe("子グループ", () => {
          it("テスト", () => {});
        });
      });
    `;
    expect(lint(code)).toEqual([]);
  });

  it("単一の describe 内に beforeEach がある場合は報告しないこと", () => {
    const code = `
      describe("グループ", () => {
        beforeEach(() => {});
        it("テスト", () => {});
      });
    `;
    expect(lint(code)).toEqual([]);
  });

  it("単一の describe 内に afterEach がある場合は報告しないこと", () => {
    const code = `
      describe("グループ", () => {
        afterEach(() => {});
        it("テスト", () => {});
      });
    `;
    expect(lint(code)).toEqual([]);
  });

  it("単一の describe 内に beforeAll がある場合は報告しないこと", () => {
    const code = `
      describe("グループ", () => {
        beforeAll(() => {});
        it("テスト", () => {});
      });
    `;
    expect(lint(code)).toEqual([]);
  });

  it("単一の describe 内に afterAll がある場合は報告しないこと", () => {
    const code = `
      describe("グループ", () => {
        afterAll(() => {});
        it("テスト", () => {});
      });
    `;
    expect(lint(code)).toEqual([]);
  });

  it("describe の外側にフック関数がある場合もエラーなく処理されること", () => {
    const code = `
      beforeEach(() => {});
      it("テスト", () => {});
    `;
    expect(lint(code)).toEqual([]);
  });

  it("単一の describe 内にテストケースが存在しない場合は報告しないこと", () => {
    const code = `
      describe("空のグループ", () => {
        const value = 1;
      });
    `;
    expect(lint(code)).toEqual([]);
  });

  it("ルートが識別子でない呼び出し式があってもクラッシュせず無視されること", () => {
    const code = `
      (() => {})()();
      (1 + 1);
    `;
    expect(lint(code)).toEqual([]);
  });
});

describe("報告する", () => {
  it("単一の describe 直下に it がある場合に報告すること", () => {
    const code = `
      describe("正常系", () => {
        it("正しい引数のとき正常に終了すること", () => {});
      });
    `;
    expect(lint(code)).toMatchObject([singleDescribeError]);
  });

  it("単一の describe 直下に test がある場合に報告すること", () => {
    const code = `
      describe("正常系", () => {
        test("正しい引数のとき正常に終了すること", () => {});
      });
    `;
    expect(lint(code)).toMatchObject([singleDescribeError]);
  });

  it("単一の describe 内に複数のテストケースがある場合でも報告すること", () => {
    const code = `
      describe("正常系", () => {
        it("テスト1", () => {});
        it("テスト2", () => {});
      });
    `;
    expect(lint(code)).toMatchObject([singleDescribeError]);
  });

  it("describe.skip や it.only などの修飾子がある場合でも検出すること", () => {
    const code = `
      describe.skip("スキップ対象", () => {
        it.only("実行対象", () => {});
      });
    `;
    expect(lint(code)).toMatchObject([singleDescribeError]);
  });

  it("describe.each を用いた単一の describe を報告すること", () => {
    const code = `
      describe.each([1, 2])("パラメータ化 %i", (val) => {
        it("検証", () => {});
      });
    `;
    expect(lint(code)).toMatchObject([singleDescribeError]);
  });

  it("TaggedTemplateExpression による describe.each を報告すること", () => {
    const code = `
      describe.each\`
        a | b
        \${1} | \${2}
      \`("パラメータ化", ({ a, b }) => {
        it("検証", () => {});
      });
    `;
    expect(lint(code)).toMatchObject([singleDescribeError]);
  });

  it("ブロック内にネストされたテストケースがあっても単一 describe を報告すること", () => {
    const code = `
      describe("正常系", () => {
        {
          it("ネストブロック内のテスト", () => {});
        }
      });
    `;
    expect(lint(code)).toMatchObject([singleDescribeError]);
  });

  it.each([
    "src/example.spec.ts",
    "src/example.test.ts",
    "src/example.spec-d.ts",
    "src/example.test-d.ts",
    String.raw`C:\workspace\src\example.spec.ts`,
  ])("各種テストファイル形式で検出できること: %s", (filename) => {
    const code = `
      describe("正常系", () => {
        it("テスト", () => {});
      });
    `;
    expect(lint(code, filename)).toMatchObject([singleDescribeError]);
  });
});
