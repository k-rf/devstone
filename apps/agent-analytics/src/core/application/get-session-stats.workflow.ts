import { Effect } from "effect";

import {
  SessionTranscriptPort,
  type SessionTranscriptError,
} from "../port/outbound/antigravity/session-transcript.port.js";

import { aggregateSessionStatsActivity } from "./aggregate-session-stats.activity.js";
import { formatStatusLineActivity } from "./format-statusline.activity.js";
import { type GetSessionStatsInput } from "./get-session-stats.input.js";
import { type GetSessionStatsOutput } from "./get-session-stats.output.js";

/**
 * 指定されたセッショントランスクリプトから統計を集計し、statusLine 出力を生成する Workflow。
 * @param input - トランスクリプトパスを含む入力データ
 * @returns 集計結果と statusLine 文字列を含む Effect
 */
export const getSessionStatsWorkflow = (
  input: GetSessionStatsInput,
): Effect.Effect<GetSessionStatsOutput, SessionTranscriptError, SessionTranscriptPort> =>
  Effect.gen(function* () {
    const transcriptPort = yield* SessionTranscriptPort;
    const toolCalls = yield* transcriptPort.readToolCalls(input.transcriptPath);
    const stats = yield* aggregateSessionStatsActivity(toolCalls);
    const statusLine = yield* formatStatusLineActivity(stats);

    return {
      stats: stats,
      statusLine: statusLine,
    };
  });
