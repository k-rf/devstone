export const assertDefined: <T>(value: T | undefined) => asserts value is T = (value) => {
  if (value === undefined) {
    throw new Error("値が未定義です");
  }
};
