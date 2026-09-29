const japaneseCharacterPattern = /[\p{scx=Hiragana}\p{scx=Katakana}\p{scx=Han}]/u;

/**
 * 文字列に日本語の文字コード（ひらがな、カタカナ、漢字）が1文字でも含まれているかを判定する。
 */
export const hasJapaneseCharacter = (text: string): boolean => {
  return japaneseCharacterPattern.test(text);
};
