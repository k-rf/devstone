import { Schema } from "effect";

import { GetSessionStatsInput } from "../../../core/application/get-session-stats.input.js";

const SnakeCaseStatusLinePayload = Schema.Struct({
  transcript_path: Schema.NonEmptyString,
}).pipe(
  Schema.transform(GetSessionStatsInput, {
    strict: true,
    decode: (payload) => ({ transcriptPath: payload.transcript_path }),
    encode: (input) => ({ transcript_path: input.transcriptPath }),
  }),
);

/**
 * statusLine の標準入力（stdin）から受け取る JSON ペイロードのスキーマ。
 * transcript_path（snake_case）および transcriptPath（camelCase）の両方を受け付けます。
 */
export const StatusLinePayload = Schema.parseJson(
  Schema.Union(SnakeCaseStatusLinePayload, GetSessionStatsInput),
);
