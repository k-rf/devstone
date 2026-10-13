import { describe, expect, it } from "vitest";

import { hasJapaneseCharacter } from "./has-japanese-character.js";

describe("日本語が含まれる場合、true を返すこと", () => {
  it.each([
    { text: "テスト", description: "カタカナ" },
    { text: "ひらがな", description: "ひらがな" },
    { text: "漢字", description: "漢字" },
    { text: "ユーザー名", description: "カタカナと漢字" },
    { text: "エラーが発生すること", description: "カタカナ、漢字、ひらがな" },
    { text: "サーバー", description: "長音記号を含むカタカナ" },
    { text: "人々", description: "踊り字を含む漢字" },
    { text: "test 成功", description: "英数字と漢字の混在" },
    { text: "123 件のデータ", description: "数字と漢字の混在" },
  ])("$description ($text) のとき true を返すこと", ({ text }) => {
    expect(hasJapaneseCharacter(text)).toBe(true);
  });
});

describe("日本語が含まれない場合、false を返すこと", () => {
  it.each([
    { text: "", description: "空文字列" },
    { text: "should return the added edge ID", description: "英語のみ" },
    { text: "test123", description: "英数字のみ" },
    { text: "12345", description: "数字のみ" },
    { text: "!@#$%^&*()_+", description: "記号のみ" },
    { text: "   ", description: "空白のみ" },
  ])("$description ($text) のとき false を返すこと", ({ text }) => {
    expect(hasJapaneseCharacter(text)).toBe(false);
  });
});
