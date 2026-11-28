import { Schema } from "effect";

/**
 * Unix エポックミリ秒（有限整数）を表すブランド付きスキーマ
 */
export const TimeInstant = Schema.Int.pipe(
  Schema.brand("TimeInstant", {
    identifier: "TimeInstant",
    description: "Unix エポックミリ秒を表す有限整数",
  }),
);

/**
 * Unix エポックミリ秒（有限整数）を表すブランド型
 */
export type TimeInstant = typeof TimeInstant.Type;
