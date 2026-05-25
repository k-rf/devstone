import { Error as PlatformError, FileSystem } from "@effect/platform";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { readCanvas } from "./read-canvas.js";

describe("正常系", () => {
  it("ファイルが存在しない場合、空のキャンバスデータを返すこと", async () => {
    const mockFs = FileSystem.layerNoop({
      exists: () => Effect.succeed(false),
    });

    const program = readCanvas("non-existent.canvas").pipe(Effect.provide(mockFs));
    const result = await Effect.runPromise(program);

    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it("正常な JSON-Canvas データを読み込み、デコードできること", async () => {
    const validData = {
      nodes: [
        {
          id: "node-1",
          type: "text",
          x: 10,
          y: 20,
          width: 100,
          height: 100,
          text: "Hello",
        },
      ],
      edges: [],
    };

    const mockFs = FileSystem.layerNoop({
      exists: () => Effect.succeed(true),
      readFileString: () => Effect.succeed(JSON.stringify(validData)),
    });

    const program = readCanvas("valid.canvas").pipe(Effect.provide(mockFs));
    const result = await Effect.runPromise(program);

    expect(result).toEqual(validData);
  });
});

describe("異常系", () => {
  it("ファイル存在確認でエラーが起きた場合、そのエラーを伝播すること", async () => {
    const mockFs = FileSystem.layerNoop({
      exists: () =>
        Effect.fail(
          new PlatformError.SystemError({
            reason: "Unknown",
            module: "FileSystem",
            method: "exists",
            description: "disk failure",
          }),
        ),
    });

    const program = readCanvas("error.canvas").pipe(Effect.provide(mockFs), Effect.flip);
    const error = await Effect.runPromise(program);

    expect(error.message).toContain(
      "ファイル存在確認エラー: Unknown: FileSystem.exists: disk failure",
    );
  });

  it("ファイル読み込み時にエラーが起きた場合、そのエラーを伝播すること", async () => {
    const mockFs = FileSystem.layerNoop({
      exists: () => Effect.succeed(true),
      readFileString: () =>
        Effect.fail(
          new PlatformError.SystemError({
            reason: "Unknown",
            module: "FileSystem",
            method: "readFileString",
            description: "read failure",
          }),
        ),
    });

    const program = readCanvas("error.canvas").pipe(Effect.provide(mockFs), Effect.flip);
    const error = await Effect.runPromise(program);

    expect(error.message).toContain(
      "ファイル読み込みエラー: Unknown: FileSystem.readFileString: read failure",
    );
  });

  it("不正な JSON フォーマットの場合、JSONパースエラーとなること", async () => {
    const mockFs = FileSystem.layerNoop({
      exists: () => Effect.succeed(true),
      readFileString: () => Effect.succeed("{ invalid json }"),
    });

    const program = readCanvas("corrupt.canvas").pipe(Effect.provide(mockFs), Effect.flip);
    const error = await Effect.runPromise(program);

    expect(error.message).toContain("JSONパースエラー");
  });

  it("JSON構造が Schema に合致しない場合、バリデーションエラーとなること", async () => {
    const invalidSchemaData = {
      nodes: "this should be an array",
    };

    const mockFs = FileSystem.layerNoop({
      exists: () => Effect.succeed(true),
      readFileString: () => Effect.succeed(JSON.stringify(invalidSchemaData)),
    });

    const program = readCanvas("invalid-schema.canvas").pipe(Effect.provide(mockFs), Effect.flip);
    const error = await Effect.runPromise(program);

    expect(error.message).toContain("キャンバスデータのバリデーションエラー");
  });
});
