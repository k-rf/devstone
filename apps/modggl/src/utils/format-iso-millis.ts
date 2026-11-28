import { DateTime } from "effect";

/**
 * Unix エポックミリ秒を ISO 8601 UTC 文字列へ整形する
 * @param epochMillis - Unix エポックミリ秒
 * @returns ISO 8601 形式の UTC 日時文字列
 */
export const formatIsoMillis = (epochMillis: number): string =>
  DateTime.formatIso(DateTime.unsafeMake(epochMillis));
