import { Effect, Layer, Schema } from "effect";
import { describe, expect, it } from "vitest";

import {
  SessionTranscriptError,
  SessionTranscriptPort,
} from "../port/outbound/antigravity/session-transcript.port.js";

import { GetSessionStatsOutput } from "./get-session-stats.output.js";
import { getSessionStatsWorkflow } from "./get-session-stats.workflow.js";

describe("正常系", () => {
  it("Port から取得したツール呼び出しを集計し、統計と statusLine を返せること", async () => {
    // Arrange
    const mockPort = Layer.succeed(SessionTranscriptPort, {
      readToolCalls: () =>
        Effect.succeed([
          {
            toolName: "read_file",
            targetPath: "/home/user/.agents/skills/commit-plan/SKILL.md",
          },
          {
            toolName: "run_command",
          },
        ]),
    });

    const program = getSessionStatsWorkflow({
      transcriptPath: "/workspace/logs/transcript.jsonl",
    }).pipe(Effect.provide(mockPort));

    // Act
    const output = await Effect.runPromise(program);
    const validatedOutput = Schema.decodeUnknownSync(GetSessionStatsOutput)(output);

    // Assert
    expect(validatedOutput).toEqual({
      stats: {
        skills: [{ name: "commit-plan", count: 1 }],
        tools: [
          { name: "read_file", count: 1 },
          { name: "run_command", count: 1 },
        ],
      },
      statusLine: "Skills: commit-plan(1) | Tools: read_file(1), run_command(1)",
    });
  });
});

describe("異常系", () => {
  it("Port が SessionTranscriptError を返した場合、エラーがそのまま伝播すること", async () => {
    // Arrange
    const mockFailingPort = Layer.succeed(SessionTranscriptPort, {
      readToolCalls: () =>
        Effect.fail(new SessionTranscriptError({ message: "トランスクリプト読み込み失敗" })),
    });

    const program = getSessionStatsWorkflow({
      transcriptPath: "/workspace/logs/missing.jsonl",
    }).pipe(Effect.provide(mockFailingPort));

    // Act
    const error = await Effect.runPromise(Effect.flip(program));

    // Assert
    expect(error).toBeInstanceOf(SessionTranscriptError);
    expect(error.message).toBe("トランスクリプト読み込み失敗");
  });
});
