import { Schema } from "effect";

const MIN_LOOKBACK_DAYS = 1;
const MAX_LOOKBACK_DAYS = 3650;

/**
 * `--since` 省略時の遡及日数（1〜3650 の整数）を表すスキーマ
 */
export const LookbackDays = Schema.Int.pipe(Schema.between(MIN_LOOKBACK_DAYS, MAX_LOOKBACK_DAYS));

/**
 * `--since` 省略時の遡及日数を表す型
 */
export type LookbackDays = typeof LookbackDays.Type;
