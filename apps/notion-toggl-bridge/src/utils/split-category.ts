/**
 * カテゴリ文字列を親 (Client) と子 (Project) に分解する
 * 形式: "親/子"
 * @param category - 分解対象のカテゴリ文字列
 * @returns 分解結果、または形式が不正な場合は undefined
 */
export const splitCategory = (
  category: string,
): { readonly parent: string; readonly child: string } | undefined => {
  const parts = category.split("/").map((p) => p.trim());
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    return undefined;
  }
  // 3階層以上ある場合は、最初の / で分ける (デザインドック準拠)
  return {
    parent: parts[0],
    child: parts.slice(1).join("/"),
  };
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("カテゴリ文字列を親と子に分割できること", () => {
    const result = splitCategory("Client / Project");
    expect(result).toEqual({ parent: "Client", child: "Project" });
  });

  it("複数のスラッシュがある場合、最初以外を子にまとめること", () => {
    const result = splitCategory("Client / Sub / Project");
    expect(result).toEqual({ parent: "Client", child: "Sub/Project" });
  });

  it("不正な形式の場合は undefined を返すこと", () => {
    expect(splitCategory("InvalidFormat")).toBeUndefined();
    expect(splitCategory("Empty /")).toBeUndefined();
    expect(splitCategory("/ Empty")).toBeUndefined();
  });
}
