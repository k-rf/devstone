import { Context, Data, type Effect } from "effect";

/**
 * 通知関連のエラー
 */
export class NotificationError extends Data.TaggedError("NotificationError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class NotificationPort extends Context.Tag("NotificationPort")<
  NotificationPort,
  {
    readonly notifyError: (
      message: string,
      details?: Record<string, unknown>,
    ) => Effect.Effect<void, NotificationError>;
  }
>() {}
