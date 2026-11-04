import { Command } from "@effect/cli";
import { FileSystem } from "@effect/platform";
import { Console, Effect, Schema } from "effect";

import { getSessionStatsWorkflow } from "../../../core/application/get-session-stats.workflow.js";
import { SessionTranscriptFsLive } from "../../outbound/antigravity/session-transcript.fs.adapter.js";

import { StatusLinePayload } from "./statusline.payload.js";

const STDIN_FILE_PATH = "/dev/stdin";

/**
 * 標準入力から statusLine ペイロードを受け取り、現在セッションの統計を1行で出力する CLI コマンド。
 */
export const statuslineCommand = Command.make("statusline").pipe(
  Command.withDescription(
    "Output current session skill and tool usage statistics in statusLine format",
  ),
  Command.withHandler(() =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const rawStdin = yield* fs.readFileString(STDIN_FILE_PATH);
      const input = yield* Schema.decodeUnknown(StatusLinePayload)(rawStdin);
      const output = yield* getSessionStatsWorkflow(input);
      yield* Console.log(output.statusLine);
    }).pipe(
      Effect.provide(SessionTranscriptFsLive),
      Effect.tapError((error) => Console.error(`Error: ${error.message}`)),
    ),
  ),
);
