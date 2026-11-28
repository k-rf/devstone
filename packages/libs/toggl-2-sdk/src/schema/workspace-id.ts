import { Schema } from "effect";

/**
 * Toggl 2.0 Workspace ID（正の整数）を表すブランド付きスキーマ
 */
export const Toggl2WorkspaceId = Schema.Int.pipe(
  Schema.positive(),
  Schema.brand("Toggl2WorkspaceId", {
    identifier: "Toggl2WorkspaceId",
    description: "Toggl 2.0 の Workspace ID（正の整数）",
  }),
);

/**
 * Toggl 2.0 Workspace ID を表すブランド型
 */
export type Toggl2WorkspaceId = typeof Toggl2WorkspaceId.Type;
