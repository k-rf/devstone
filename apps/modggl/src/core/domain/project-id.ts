import { Schema } from "effect";

/**
 * プロジェクト ID（正の整数）を表すブランド付きスキーマ
 */
export const ProjectId = Schema.Int.pipe(
  Schema.positive(),
  Schema.brand("ProjectId", {
    identifier: "ProjectId",
    description: "プロジェクト ID（正の整数）",
  }),
);

/**
 * プロジェクト ID を表すブランド型
 */
export type ProjectId = typeof ProjectId.Type;
