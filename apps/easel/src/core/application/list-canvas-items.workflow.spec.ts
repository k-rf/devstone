import { JsonCanvas as JsonCanvasSchema, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Layer, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { CanvasRepository } from "../port/repository/canvas.repository.js";

import { listCanvasItemsWorkflow } from "./list-canvas-items.workflow.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvasSchema)({
  nodes: [
    { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
  ],
  edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
});

const makeTestCanvasRepository = (canvasRef: { current: JsonCanvas }) =>
  Layer.succeed(
    CanvasRepository,
    CanvasRepository.of({
      read: () => Effect.sync(() => canvasRef.current),
      write: (canvas) =>
        Effect.sync(() => {
          canvasRef.current = canvas;
        }),
    }),
  );

describe("キャンバスアイテム一覧をフォーマット出力するワークフロー", () => {
  describe("正常系", () => {
    it("キャンバス内のすべてのノードとエッジが整形された文字列として取得できること", async () => {
      const state = { current: { ...initialCanvas } };
      const program = listCanvasItemsWorkflow().pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      const result = await Effect.runPromise(program);

      expect(result).toContain("=== Nodes ===");
      expect(result).toContain("- node-1 [text]");
      expect(result).toContain("- node-2 [file]");
      expect(result).toContain("=== Edges ===");
      expect(result).toContain("- edge-1 [node-1 -> node-2]");
    });
  });
});
