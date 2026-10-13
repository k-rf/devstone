const ignoredPattern = /(?:\.(?:spec|test)(?:-d)?|\.stories)\.[cm]?[jt]sx?$|\.d\.[cm]?ts$/u;

/**
 * テストファイル、Storybook ファイル、型定義ファイルなど、
 * ルールの検査対象外となるファイルかどうかを判定する。
 */
export const isIgnoredFile = (filename: string): boolean => {
  const normalized = filename.replaceAll("\\", "/");
  return ignoredPattern.test(normalized);
};
