import { Error as PlatformError, FileSystem } from "@effect/platform";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";

import { writeCanvas } from "./write-canvas.js";

describe("正常系", () => {
  it("正常な JSON-Canvas データをバリデーションしてファイルに書き込めること", async () => {
    let writtenPath = "";
    let writtenData = "";

    const mockFs = FileSystem.layerNoop({
      writeFileString: (path, data) => {
        writtenPath = path;
        writtenData = data;
        return Effect.void;
      },
    });

    const canvasData = {
      nodes: [],
      edges: [],
    };

    const program = writeCanvas("output.canvas", canvasData).pipe(Effect.provide(mockFs));
    await Effect.runPromise(program);

    expect(writtenPath).toBe("output.canvas");
    expect(JSON.parse(writtenData)).toEqual(canvasData);
  });
});

describe("異常系", () => {
  it("ファイル書き込み時にエラーが発生した場合、そのエラーを伝播すること", async () => {
    const mockFs = FileSystem.layerNoop({
      writeFileString: () =>
        Effect.fail(
          new PlatformError.SystemError({
            reason: "Unknown",
            module: "FileSystem",
            method: "writeFileString",
            description: "write permission denied",
          }),
        ),
    });

    const canvasData = {
      nodes: [],
      edges: [],
    };

    const program = writeCanvas("output.canvas", canvasData).pipe(
      Effect.provide(mockFs),
      Effect.flip,
    );
    const error = await Effect.runPromise(program);

    expect(error.message).toContain(
      "ファイル書き込みエラー: Unknown: FileSystem.writeFileString: write permission denied",
    );
  });
});
