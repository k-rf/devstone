export const assertDefined: <T>(value: T | undefined) => asserts value is T = (value) => {
  if (value === undefined) {
    throw new Error("値が未定義です");
  }
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("undefined のとき、例外を送出すること", () => {
    expect(() => {
      assertDefined(undefined);
    }).toThrow("値が未定義です");
  });
}
