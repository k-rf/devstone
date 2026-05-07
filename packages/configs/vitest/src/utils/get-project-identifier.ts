/**
 * ワークスペースルートからの相対パスに基づいて、ユニークなプロジェクト名を生成する
 */
export const getProjectIdentifier = (projectPath: string, rootDir: string): string => {
  return projectPath.replace(rootDir, "").replace(/^\//, "").replaceAll("/", "-");
};
