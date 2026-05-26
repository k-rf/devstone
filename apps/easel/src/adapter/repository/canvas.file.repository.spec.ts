import path from "node:path";

import { JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { FileSystem } from "@effect/platform";
import { SystemError } from "@effect/platform/Error";
import { Effect, Layer, Schema } from "effect";
import { vol } from "memfs";
import { beforeEach, describe, expect, it } from "vitest";

import { CanvasError } from "../../core/domain/errors.js";
import { CanvasRepository } from "../../core/port/repository/canvas.repository.js";
import { mockFileSystem } from "../../test-utils/mock-fs.js";

import { CanvasFileConfig, CanvasFileRepository } from "./canvas.file.repository.js";

const testFilePath = path.join(process.cwd(), "test.canvas");

const makeTestLayer = (filePath: string = testFilePath) =>
  CanvasFileRepository.pipe(
    Layer.provide(mockFileSystem),
    Layer.provide(Layer.succeed(CanvasFileConfig, { filePath: filePath })),
  );

describe("CanvasFileRepository によるファイル入出力", () => {
  beforeEach(() => {
    vol.reset();
    vol.mkdirSync(process.cwd(), { recursive: true });
  });

  describe("正常系", () => {
    it("ファイルが存在し、正しいJSON Canvasの場合に読み込みができること", async () => {
      // Arrange
      const validCanvas = {
        nodes: [{ id: "n1", type: "text", x: 0, y: 0, width: 10, height: 10, text: "hello" }],
        edges: [],
      };
      vol.fromJSON({ [testFilePath]: JSON.stringify(validCanvas) });

      const program = Effect.gen(function* () {
        const repo = yield* CanvasRepository;
        return yield* repo.read();
      }).pipe(Effect.provide(makeTestLayer()));

      // Act
      const result = await Effect.runPromise(program);

      // Assert
      expect(result.nodes?.[0]?.id).toBe("n1");
    });

    it("ファイルが存在しない場合、空のキャンバスデータを返すこと", async () => {
      // Arrange
      const program = Effect.gen(function* () {
        const repo = yield* CanvasRepository;
        return yield* repo.read();
      }).pipe(Effect.provide(makeTestLayer()));

      // Act
      const result = await Effect.runPromise(program);

      // Assert
      expect(result).toEqual({ nodes: [], edges: [] });
    });

    it("正常にキャンバスデータを書き込めること", async () => {
      // Arrange
      const canvas = { nodes: [], edges: [] };
      const program = Effect.gen(function* () {
        const repo = yield* CanvasRepository;
        yield* repo.write(canvas);
      }).pipe(Effect.provide(makeTestLayer()));

      // Act
      await Effect.runPromise(program);

      // Assert
      const writtenData = vol.readFileSync(testFilePath, "utf8");
      expect(JSON.parse(writtenData as string)).toEqual(canvas);
    });

    it("nodes と edges が1行になったカスタム JSON 形式で書き込めること", async () => {
      // Arrange
      const canvas = Schema.decodeSync(JsonCanvas)({
        nodes: [
          { id: "n1", type: "text", x: 0, y: 0, width: 100, height: 100, text: "hello" },
          { id: "n2", type: "file", x: 200, y: 200, width: 80, height: 80, file: "doc.md" },
        ],
        edges: [{ id: "e1", fromNode: "n1", toNode: "n2", color: "1" }],
      });
      const program = Effect.gen(function* () {
        const repo = yield* CanvasRepository;
        yield* repo.write(canvas);
      }).pipe(Effect.provide(makeTestLayer()));

      // Act
      await Effect.runPromise(program);

      // Assert
      const writtenData = vol.readFileSync(testFilePath, "utf8") as string;
      const expectedLines = [
        "{",
        '  "nodes": [',
        '    {"id":"n1","type":"text","x":0,"y":0,"width":100,"height":100,"text":"hello"},',
        '    {"id":"n2","type":"file","x":200,"y":200,"width":80,"height":80,"file":"doc.md"}',
        "  ],",
        '  "edges": [',
        '    {"id":"e1","fromNode":"n1","toNode":"n2","color":"1"}',
        "  ]",
        "}",
      ].join("\n");

      expect(writtenData).toBe(expectedLines);
    });

    it("nodes と edges が undefined のキャンバスデータを正常に書き込めること", async () => {
      // Arrange
      const canvas = Schema.decodeSync(JsonCanvas)({});
      const program = Effect.gen(function* () {
        const repo = yield* CanvasRepository;
        yield* repo.write(canvas);
      }).pipe(Effect.provide(makeTestLayer()));

      // Act
      await Effect.runPromise(program);

      // Assert
      const writtenData = vol.readFileSync(testFilePath, "utf8");
      expect(writtenData).toBe("{}");
    });
  });

  describe("異常系", () => {
    it("exists が失敗したとき、CanvasError (ファイル存在確認エラー) を返すこと", async () => {
      // Arrange
      const program = Effect.gen(function* () {
        const repo = yield* CanvasRepository;
        return yield* repo.read();
      }).pipe(Effect.provide(makeTestLayer(path.join(process.cwd(), "test\0.canvas"))));

      // Act
      const resultError = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(resultError).toBeInstanceOf(CanvasError);
      expect(resultError.message).toContain("ファイル存在確認エラー");
    });

    it("readFileString が失敗したとき、CanvasError (ファイル読み込みエラー) を返すこと", async () => {
      // Arrange
      const dirPath = path.join(process.cwd(), "test-dir");
      vol.mkdirSync(dirPath);

      const program = Effect.gen(function* () {
        const repo = yield* CanvasRepository;
        return yield* repo.read();
      }).pipe(Effect.provide(makeTestLayer(dirPath)));

      // Act
      const resultError = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(resultError).toBeInstanceOf(CanvasError);
      expect(resultError.message).toContain("ファイル読み込みエラー");
    });

    it("JSON パースに失敗したとき、CanvasError (JSONパースエラー) を返すこと", async () => {
      // Arrange
      vol.fromJSON({ [testFilePath]: "invalid json string" });

      const program = Effect.gen(function* () {
        const repo = yield* CanvasRepository;
        return yield* repo.read();
      }).pipe(Effect.provide(makeTestLayer()));

      // Act
      const resultError = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(resultError).toBeInstanceOf(CanvasError);
      expect(resultError.message).toContain("JSONパースエラー");
    });

    it("Schema のバリデーションに失敗したとき、CanvasError (バリデーションエラー) を返すこと", async () => {
      // Arrange
      const invalidCanvas = {
        nodes: [{ id: "n1", type: "invalid_type_here" }],
      };
      vol.fromJSON({ [testFilePath]: JSON.stringify(invalidCanvas) });

      const program = Effect.gen(function* () {
        const repo = yield* CanvasRepository;
        return yield* repo.read();
      }).pipe(Effect.provide(makeTestLayer()));

      // Act
      const resultError = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(resultError).toBeInstanceOf(CanvasError);
      expect(resultError.message).toContain("キャンバスデータのバリデーションエラー");
    });

    it("writeFileString が失敗したとき、CanvasError (ファイル書き込みエラー) を返すこと", async () => {
      // Arrange
      const dirPath = path.join(process.cwd(), "test-dir");
      vol.mkdirSync(dirPath);

      const canvas = { nodes: [], edges: [] };
      const program = Effect.gen(function* () {
        const repo = yield* CanvasRepository;
        yield* repo.write(canvas);
      }).pipe(Effect.provide(makeTestLayer(dirPath)));

      // Act
      const resultError = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(resultError).toBeInstanceOf(CanvasError);
      expect(resultError.message).toContain("ファイル書き込みエラー");
    });

    it("remove が失敗したとき、SystemError を返すこと", async () => {
      // Arrange
      const program = Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        yield* fs.remove("test\0.canvas");
      }).pipe(Effect.provide(mockFileSystem));

      // Act
      const resultError = await Effect.runPromise(Effect.flip(program));

      // Assert
      expect(resultError).toBeInstanceOf(SystemError);
    });

    it("ディレクトリに対する stat が正常に情報を返すこと", async () => {
      // Arrange
      const dirPath = path.join(process.cwd(), "test-dir");
      vol.mkdirSync(dirPath);

      const program = Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        return yield* fs.stat(dirPath);
      }).pipe(Effect.provide(mockFileSystem));

      // Act
      const info = await Effect.runPromise(program);

      // Assert
      expect(info.type).toBe("Directory");
    });
  });
});
