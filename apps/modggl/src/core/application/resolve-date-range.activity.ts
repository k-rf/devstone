import { DateTime, Effect, Option } from "effect";

import { type LookbackDays } from "./lookback-days.input.js";
import { InvalidDateRangeError } from "./modify-entries.output.js";

/**
 * 取得期間の入力パラメータ
 */
export interface DateRangeParams {
  readonly since: Option.Option<DateTime.Utc>;
  readonly until: Option.Option<DateTime.Utc>;
  readonly days: LookbackDays;
}

/**
 * 解決された取得期間
 */
export interface ResolvedDateRange {
  readonly since: DateTime.Utc;
  readonly until: DateTime.Utc;
}

/**
 * 指定された期間または基準日数から取得範囲 `[since, until]` を算出し、前後関係を検証する Activity
 * @param params - 期間指定および遡及日数
 * @returns 検証済みの取得範囲、または `since >= until` の場合に `InvalidDateRangeError` を返す Effect
 */
export const resolveDateRangeActivity = (
  params: DateRangeParams,
): Effect.Effect<ResolvedDateRange, InvalidDateRangeError> =>
  Effect.gen(function* () {
    const now = yield* DateTime.now;
    const since = Option.getOrElse(params.since, () =>
      DateTime.subtract(now, { days: params.days }),
    );
    const until = Option.getOrElse(params.until, () => DateTime.add(now, { days: 1 }));

    if (since.epochMillis >= until.epochMillis) {
      return yield* Effect.fail(
        new InvalidDateRangeError({
          message: `取得開始日時 (${DateTime.formatIso(since)}) は終了日時 (${DateTime.formatIso(until)}) より前である必要があります`,
          since: since,
          until: until,
        }),
      );
    }

    return {
      since: since,
      until: until,
    };
  });
