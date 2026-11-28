import { Schema } from "effect";

/**
 * Toggl 2.0 Organization ID（正の整数）を表すブランド付きスキーマ
 */
export const Toggl2OrganizationId = Schema.Int.pipe(
  Schema.positive(),
  Schema.brand("Toggl2OrganizationId", {
    identifier: "Toggl2OrganizationId",
    description: "Toggl 2.0 の Organization ID（正の整数）",
  }),
);

/**
 * Toggl 2.0 Organization ID を表すブランド型
 */
export type Toggl2OrganizationId = typeof Toggl2OrganizationId.Type;
