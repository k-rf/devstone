import { Data } from "effect";

/**
 * Toggl API 通信・操作に関するエラー
 */
export class TogglApiError extends Data.TaggedError("TogglApiError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}
