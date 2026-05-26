import { JsonCanvas as JsonCanvasSchema, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Layer, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { CanvasRepository } from "../port/repository/canvas.repository.js";

import { addNodeWorkflow } from "./add-node.workflow.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvasSchema)({
  nodes: [],
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

describe("キャンバスへのノード追加ワークフロー", () => {
  describe("正常系", () => {
    it("正しいノードデータを渡した場合、ノードが正常に追加され、そのIDが返されること", async () => {
      const state = { current: { ...initialCanvas } };
      const newNodeData = {
        id: "node-3",
        type: "text",
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        text: "New",
      };
      const program = addNodeWorkflow(newNodeData).pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      const addedId = await Effect.runPromise(program);

      expect(addedId).toBe("node-3");
      expect(state.current.nodes?.length).toBe(1);
      expect(state.current.nodes?.[0]).toEqual(newNodeData);
    });
  });

  describe("異常系", () => {
    it("必須属性が欠けているなどの不正なノードデータの場合、検証エラーが返されること", async () => {
      const state = { current: { ...initialCanvas } };
      const invalidNodeData = { id: "node-3", type: "text" };
      const program = addNodeWorkflow(invalidNodeData).pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      const error = await Effect.runPromise(Effect.flip(program));

      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("ノードデータの検証に失敗しました");
    });
  });
});
