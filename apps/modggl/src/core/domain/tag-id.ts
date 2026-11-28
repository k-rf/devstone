import { Schema } from "effect";

/**
 * タグ ID（正の整数）を表すブランド付きスキーマ
 */
export const TagId = Schema.Int.pipe(
  Schema.positive(),
  Schema.brand("TagId", {
    identifier: "TagId",
    description: "タグ ID（正の整数）",
  }),
);

/**
 * タグ ID を表すブランド型
 */
export type TagId = typeof TagId.Type;
