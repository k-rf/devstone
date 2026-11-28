import { Schema } from "effect";

/**
 * クライアント ID（正の整数）を表すブランド付きスキーマ
 */
export const ClientId = Schema.Int.pipe(
  Schema.positive(),
  Schema.brand("ClientId", {
    identifier: "ClientId",
    description: "クライアント ID（正の整数）",
  }),
);

/**
 * クライアント ID を表すブランド型
 */
export type ClientId = typeof ClientId.Type;
