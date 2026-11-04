import { Context, Data, type Effect } from "effect";

import { type ToolCallEntry } from "../../../domain/session-stats.js";

/**
 * セッショントランスクリプトの読み取り・解析に関するエラー。
 */
export class SessionTranscriptError extends Data.TaggedError("SessionTranscriptError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * セッショントランスクリプトからツール呼び出し履歴を取得するための Outbound Port。
 */
export class SessionTranscriptPort extends Context.Tag("SessionTranscriptPort")<
  SessionTranscriptPort,
  {
    readonly readToolCalls: (
      transcriptPath: string,
    ) => Effect.Effect<readonly ToolCallEntry[], SessionTranscriptError>;
  }
>() {}
