import path from "node:path";

import { Effect, Layer } from "effect";
import { vol } from "memfs";
import { beforeEach, describe, expect, it } from "vitest";

import {
  SessionTranscriptError,
  SessionTranscriptPort,
} from "../../../core/port/outbound/antigravity/session-transcript.port.js";
import { mockFileSystem } from "../../../test-utils/mock-fs.js";

import { SessionTranscriptFsLive } from "./session-transcript.fs.adapter.js";

const logsDir = path.join(process.cwd(), "logs");
const compactPath = path.join(logsDir, "transcript.jsonl");
const fullPath = path.join(logsDir, "transcript_full.jsonl");

const testLayer = SessionTranscriptFsLive.pipe(Layer.provide(mockFileSystem));

beforeEach(() => {
  vol.reset();
  vol.mkdirSync(logsDir, { recursive: true });
});

describe("正常系", () => {
  it("truncated_fields に tool_calls が無い場合、transcript.jsonl のみからツール呼び出しを読み取れること", async () => {
    // Arrange
    const compactContent = [
      JSON.stringify({
        step_index: 1,
        tool_calls: [
          {
            name: "read_file",
            args: { Path: '"/workspace/.agents/skills/notion-context-sync/SKILL.md"' },
          },
        ],
      }),
      "",
    ].join("\n");

    vol.fromJSON({
      [compactPath]: compactContent,
    });

    const program = Effect.gen(function* () {
      const port = yield* SessionTranscriptPort;
      return yield* port.readToolCalls(compactPath);
    }).pipe(Effect.provide(testLayer));

    // Act
    const result = await Effect.runPromise(program);

    // Assert
    expect(result).toEqual([
      {
        toolName: "read_file",
        targetPath: "/workspace/.agents/skills/notion-context-sync/SKILL.md",
      },
    ]);
  });

  it("truncated_fields に tool_calls がある場合、同ディレクトリの transcript_full.jsonl から補完できること", async () => {
    // Arrange
    const compactContent = JSON.stringify({
      step_index: 2,
      truncated_fields: ["tool_calls"],
      tool_calls: [],
    });
    const fullContent = JSON.stringify({
      step_index: 2,
      tool_calls: [
        {
          name: "view_file",
          args: { AbsolutePath: "/workspace/.agents/skills/git-commit/SKILL.md" },
        },
      ],
    });

    vol.fromJSON({
      [compactPath]: compactContent,
      [fullPath]: fullContent,
    });

    const program = Effect.gen(function* () {
      const port = yield* SessionTranscriptPort;
      return yield* port.readToolCalls(compactPath);
    }).pipe(Effect.provide(testLayer));

    // Act
    const result = await Effect.runPromise(program);

    // Assert
    expect(result).toEqual([
      {
        toolName: "view_file",
        targetPath: "/workspace/.agents/skills/git-commit/SKILL.md",
      },
    ]);
  });

  it("truncated_fields に tool_calls があっても transcript_full.jsonl が存在しない場合はコンパクト版にフォールバックすること", async () => {
    // Arrange
    const compactContent = JSON.stringify({
      step_index: 2,
      truncated_fields: ["tool_calls"],
      tool_calls: [{ name: "run_command" }],
    });

    vol.fromJSON({
      [compactPath]: compactContent,
    });

    const program = Effect.gen(function* () {
      const port = yield* SessionTranscriptPort;
      return yield* port.readToolCalls(compactPath);
    }).pipe(Effect.provide(testLayer));

    // Act
    const result = await Effect.runPromise(program);

    // Assert
    expect(result).toEqual([{ toolName: "run_command" }]);
  });
});

describe("異常系", () => {
  it("transcript.jsonl が存在しない場合、SessionTranscriptError を返すこと", async () => {
    // Arrange
    const program = Effect.gen(function* () {
      const port = yield* SessionTranscriptPort;
      return yield* port.readToolCalls(compactPath);
    }).pipe(Effect.provide(testLayer));

    // Act
    const error = await Effect.runPromise(Effect.flip(program));

    // Assert
    expect(error).toBeInstanceOf(SessionTranscriptError);
    expect(error.message).toContain("トランスクリプトファイルの読み込みに失敗しました");
  });

  it("transcript.jsonl に不正な JSON 行が含まれる場合、SessionTranscriptError を返すこと", async () => {
    // Arrange
    vol.fromJSON({
      [compactPath]: "{ invalid json }",
    });

    const program = Effect.gen(function* () {
      const port = yield* SessionTranscriptPort;
      return yield* port.readToolCalls(compactPath);
    }).pipe(Effect.provide(testLayer));

    // Act
    const error = await Effect.runPromise(Effect.flip(program));

    // Assert
    expect(error).toBeInstanceOf(SessionTranscriptError);
    expect(error.message).toContain("トランスクリプト行のパースに失敗しました");
  });

  it("完全版トランスクリプトの存在確認が失敗した場合、SessionTranscriptError を返すこと", async () => {
    // Arrange
    const errorDirPath = path.join(logsDir, "__exists_error__");
    const errorCompactPath = path.join(errorDirPath, "transcript.jsonl");
    vol.fromJSON({
      [errorCompactPath]: JSON.stringify({
        step_index: 1,
        truncated_fields: ["tool_calls"],
      }),
    });

    const program = Effect.gen(function* () {
      const port = yield* SessionTranscriptPort;
      return yield* port.readToolCalls(errorCompactPath);
    }).pipe(Effect.provide(testLayer));

    // Act
    const error = await Effect.runPromise(Effect.flip(program));

    // Assert
    expect(error).toBeInstanceOf(SessionTranscriptError);
    expect(error.message).toContain("完全版トランスクリプトの存在確認に失敗しました");
  });
});
