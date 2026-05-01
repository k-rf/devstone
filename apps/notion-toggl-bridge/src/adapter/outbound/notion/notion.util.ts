/**
 * Notion のリッチテキスト配列をプレーンテキストに結合する
 * @param richText - Notion のリッチテキスト構造を持つ配列
 * @returns 結合されたプレーンテキスト
 */
export const normalizeRichText = (richText: readonly unknown[]): string => {
  return richText
    .map((t) => {
      if (
        typeof t === "object" &&
        t !== null &&
        "plain_text" in t &&
        typeof t.plain_text === "string"
      ) {
        return t.plain_text;
      }
      return "";
    })
    .join("");
};
