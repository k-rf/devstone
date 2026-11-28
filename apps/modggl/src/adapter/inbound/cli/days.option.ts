import { Options } from "@effect/cli";

import { LookbackDays } from "../../../core/application/lookback-days.input.js";

const defaultDays = 7;

/**
 * `--since` 省略時の遡及日数を指定するオプション（既定値: 7）
 */
export const daysOption = Options.integer("days").pipe(
  Options.withSchema(LookbackDays),
  Options.withDefault(defaultDays),
  Options.withDescription("Number of days to look back when --since is omitted (default: 7)"),
);
