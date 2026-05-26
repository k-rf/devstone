import { JsonCanvas as JsonCanvasSchema, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Layer, Option, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { CanvasRepository } from "../port/repository/canvas.repository.js";

import { updateEdgeWorkflow } from "./update-edge.workflow.js";

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

describe("キャンバス内エッジの更新ワークフロー", () => {
  describe("正常系", () => {
    it("存在するエッジに対して正しいパラメータを渡したとき、データが正常にマージされて更新されること", async () => {
      const state = { current: { ...initialCanvas } };
      const program = updateEdgeWorkflow({
        id: "edge-1",
        fromNode: Option.some("node-1"),
        toNode: Option.some("node-2"),
        fromSide: Option.none(),
        toSide: Option.none(),
        fromEnd: Option.none(),
        toEnd: Option.none(),
        color: Option.some("3"),
        label: Option.some("Updated"),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      await Effect.runPromise(program);

      expect(state.current.edges?.find((e) => e.id === "edge-1")?.color).toBe("3");
    });
  });

  describe("異常系", () => {
    it("不正なカラーコードなどのパラメータを渡したとき、検証エラーが返されること", async () => {
      const state = { current: { ...initialCanvas } };
      const program = updateEdgeWorkflow({
        id: "edge-1",
        fromNode: Option.none(),
        toNode: Option.none(),
        fromSide: Option.none(),
        toSide: Option.none(),
        fromEnd: Option.none(),
        toEnd: Option.none(),
        color: Option.some("invalid-color-preset"),
        label: Option.none(),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      const error = await Effect.runPromise(Effect.flip(program));

      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("エッジデータの検証に失敗しました");
    });

    it("更新対象のエッジ ID がキャンバスに存在しないとき、エッジ未検出のエラーが返されること", async () => {
      const state = { current: { ...initialCanvas } };
      const program = updateEdgeWorkflow({
        id: "non-existent-edge",
        fromNode: Option.none(),
        toNode: Option.none(),
        fromSide: Option.none(),
        toSide: Option.none(),
        fromEnd: Option.none(),
        toEnd: Option.none(),
        color: Option.none(),
        label: Option.none(),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      const error = await Effect.runPromise(Effect.flip(program));

      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("のエッジが見つかりませんでした");
    });
  });
});
