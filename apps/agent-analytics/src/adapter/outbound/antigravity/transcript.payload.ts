import { Schema } from "effect";

/**
 * トランスクリプト行に含まれる単一のツール呼び出しペイロード。
 */
export const TranscriptToolCallPayload = Schema.Struct({
  name: Schema.NonEmptyString,
  args: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Unknown,
    }),
  ),
});

export type TranscriptToolCallPayload = typeof TranscriptToolCallPayload.Type;

/**
 * トランスクリプト（JSONL）の1行分のステップペイロード。
 */
export const TranscriptStepPayload = Schema.Struct({
  step_index: Schema.optional(Schema.Number),
  tool_calls: Schema.optional(Schema.Array(TranscriptToolCallPayload)),
  truncated_fields: Schema.optional(Schema.Array(Schema.String)),
});

export type TranscriptStepPayload = typeof TranscriptStepPayload.Type;

/**
 * JSON 文字列から TranscriptStepPayload へデコードするスキーマ。
 */
export const TranscriptStepFromJsonPayload = Schema.parseJson(TranscriptStepPayload);
