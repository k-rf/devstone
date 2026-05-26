import { JsonCanvas as JsonCanvasSchema, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Layer, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { CanvasRepository } from "../port/repository/canvas.repository.js";

import { addEdgeWorkflow } from "./add-edge.workflow.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvasSchema)({
  nodes: [
    { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
  ],
  edges: [],
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

describe("キャンバスへのエッジ追加ワークフロー", () => {
  describe("正常系", () => {
    it("正しいエッジデータを渡した場合、エッジが正常に追加され、そのIDが返されること", async () => {
      const state = { current: { ...initialCanvas } };
      const newEdgeData = { id: "edge-2", fromNode: "node-2", toNode: "node-1", color: "2" };
      const program = addEdgeWorkflow(newEdgeData).pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      const addedId = await Effect.runPromise(program);

      expect(addedId).toBe("edge-2");
      expect(state.current.edges?.length).toBe(1);
    });
  });

  describe("異常系", () => {
    it("必須属性が欠けているなどの不正なエッジデータの場合、検証エラーが返されること", async () => {
      const state = { current: { ...initialCanvas } };
      const invalidEdgeData = { id: "edge-2", color: "1" };
      const program = addEdgeWorkflow(invalidEdgeData).pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      const error = await Effect.runPromise(Effect.flip(program));

      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("エッジデータの検証に失敗しました");
    });
  });
});
