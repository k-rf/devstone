/**
 * Notion のリッチテキスト配列をプレーンテキストに結合する
 * @param richText - Notion のリッチテキスト構造を持つ配列
 * @returns 結合されたプレーンテキスト
 */
export const normalizeRichText = (richText: readonly unknown[]): string => {
  return richText
    .map((t) => {
      if (t && typeof t === "object" && "plain_text" in t && typeof t.plain_text === "string") {
        return t.plain_text;
      }
      return "";
    })
    .join("");
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("リッチテキストを正常にプレーンテキストに変換できること", () => {
    const input = [{ plain_text: "Hello " }, { plain_text: "World" }];
    expect(normalizeRichText(input)).toBe("Hello World");
  });

  it("plain_text プロパティがない要素は無視されること", () => {
    const input = [{ plain_text: "Valid" }, { something_else: "Invalid" }, undefined, 123];
    expect(normalizeRichText(input)).toBe("Valid");
  });
}
