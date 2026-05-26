import { JsonCanvas as JsonCanvasSchema, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Layer, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { CanvasRepository } from "../port/repository/canvas.repository.js";

import { getCanvasItemWorkflow } from "./get-canvas-item.workflow.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvasSchema)({
  nodes: [{ id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" }],
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

describe("キャンバスアイテムを取得するワークフロー", () => {
  describe("正常系", () => {
    it("指定された ID のアイテムがキャンバスに存在する場合、そのアイテムを取得できること", async () => {
      const state = { current: { ...initialCanvas } };
      const program = getCanvasItemWorkflow("node-1").pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      const result = await Effect.runPromise(program);

      expect(result.type).toBe("node");
      expect(result.data.id).toBe("node-1");
    });
  });
});
