import { Data, Effect, Schema, type ParseResult } from "effect";

import { type TimeInstant } from "./time-instant.js";
import { TimeInterval } from "./time-interval.js";

/**
 * 不正な時間区間の生成を試みた際に発生する型付きエラー
 */
export class InvalidTimeIntervalError extends Data.TaggedError("InvalidTimeIntervalError")<{
  readonly message: string;
  readonly start: TimeInstant;
  readonly end: TimeInstant;
  readonly cause: ParseResult.ParseError;
}> {}

/**
 * 開始時刻と終了時刻から不変な `TimeInterval` を生成する
 * @param start - 開始時刻（Unix エポックミリ秒）
 * @param end - 終了時刻（Unix エポックミリ秒、`start <= end`）
 * @returns 検証済みの `TimeInterval`、または不正区間の場合に `InvalidTimeIntervalError` を失敗チャネルに持つ `Effect`
 */
export const createTimeInterval = (
  start: TimeInstant,
  end: TimeInstant,
): Effect.Effect<TimeInterval, InvalidTimeIntervalError> =>
  Schema.decodeUnknown(TimeInterval)({ start: start, end: end }).pipe(
    Effect.mapError(
      (cause) =>
        new InvalidTimeIntervalError({
          message: `開始時刻 (${String(start)}) は終了時刻 (${String(end)}) 以下である必要があります`,
          start: start,
          end: end,
          cause: cause,
        }),
    ),
  );
