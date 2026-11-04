import path from "node:path";

import { BunContext } from "@effect/platform-bun";
import { Effect } from "effect";
import { vol } from "memfs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "./app.js";
import { mockFileSystem } from "./test-utils/mock-fs.js";

const executeCli = (args: readonly string[]) => runCli(["node", "main.js", ...args]);

const provideTestContext = <R, E, A>(effect: Effect.Effect<A, E, R>) =>
  effect.pipe(Effect.provide(mockFileSystem), Effect.provide(BunContext.layer));

const transcriptPath = path.join(process.cwd(), "transcript.jsonl");

beforeEach(() => {
  vol.reset();
  vol.mkdirSync(process.cwd(), { recursive: true });
});

describe("正常系", () => {
  it("statusline サブコマンドが stdin の JSON からトランスクリプトを読み取り、1行サマリを出力すること", async () => {
    // Arrange
    const logSpy = vi.spyOn(console, "log");
    const transcriptLines = [
      JSON.stringify({
        step_index: 1,
        tool_calls: [
          {
            name: "read_file",
            args: { Path: '"/workspace/.agents/skills/notion-context-sync/SKILL.md"' },
          },
          {
            name: "run_command",
            args: { CommandLine: "git status" },
          },
        ],
      }),
    ].join("\n");

    vol.fromJSON({
      "/dev/stdin": JSON.stringify({ transcript_path: transcriptPath }),
      [transcriptPath]: transcriptLines,
    });

    // Act
    await Effect.runPromise(provideTestContext(executeCli(["statusline"])));

    // Assert
    expect(logSpy).toHaveBeenCalledWith(
      "Skills: notion-context-sync(1) | Tools: read_file(1), run_command(1)",
    );
    logSpy.mockRestore();
  });
});

describe("異常系", () => {
  it("stdin の JSON が不正な場合、エラーログを出力して失敗すること", async () => {
    // Arrange
    vol.fromJSON({
      "/dev/stdin": "invalid-json",
    });

    // Act
    const error = await Effect.runPromise(
      Effect.flip(provideTestContext(executeCli(["statusline"]))),
    );

    // Assert
    expect(error).toBeDefined();
  });
});
