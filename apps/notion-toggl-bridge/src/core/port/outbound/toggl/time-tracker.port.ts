import { Context, Data, type Effect } from "effect";

import { type TrackingEntry } from "../../../domain/tracking-entry";

/**
 * タイムトラッカー関連のエラー
 */
export class TimeTrackerError extends Data.TaggedError("TimeTrackerError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class TimeTrackerPort extends Context.Tag("TimeTrackerPort")<
  TimeTrackerPort,
  {
    readonly startTimer: (entry: TrackingEntry) => Effect.Effect<void, TimeTrackerError>;
  }
>() {}
