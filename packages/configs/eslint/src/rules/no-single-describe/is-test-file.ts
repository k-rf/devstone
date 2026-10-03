const testFilePattern = /(?:\.(?:spec|test)(?:-d)?)\.[cm]?[jt]sx?$/u;

/**
 * テストファイル（*.spec.ts, *.test.ts, *.spec-d.ts 等）かどうかを判定する。
 */
export const isTestFile = (filename: string): boolean => {
  const normalized = filename.replaceAll("\\", "/");
  return testFilePattern.test(normalized);
};
