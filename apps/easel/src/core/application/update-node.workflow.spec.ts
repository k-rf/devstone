import { JsonCanvas as JsonCanvasSchema, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Layer, Option, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { assertTextNode } from "../../test-utils/assert-node/assert-text-node.js";
import { CanvasRepository } from "../port/repository/canvas.repository.js";

import { updateNodeWorkflow } from "./update-node.workflow.js";

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

describe("キャンバス内ノードの更新ワークフロー", () => {
  describe("正常系", () => {
    it("存在するノードに対して正しいパラメータを渡したとき、データが正常にマージされて更新されること", async () => {
      const state = { current: { ...initialCanvas } };
      const program = updateNodeWorkflow({
        id: "node-1",
        type: "text",
        x: Option.some(15),
        y: Option.some(25),
        width: Option.some(100),
        height: Option.some(50),
        color: Option.none(),
        text: Option.some("Updated"),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      await Effect.runPromise(program);

      const foundNode = state.current.nodes?.find((n) => n.id === "node-1");

      assertTextNode(foundNode);
      expect(foundNode.text).toBe("Updated");
      expect(foundNode.x).toBe(15);
      expect(foundNode.y).toBe(25);
    });
  });

  describe("異常系", () => {
    it("不正な色や座標などのパラメータを渡したとき、検証エラーが返されること", async () => {
      const state = { current: { ...initialCanvas } };
      const program = updateNodeWorkflow({
        id: "node-1",
        type: "text",
        x: Option.none(),
        y: Option.none(),
        width: Option.none(),
        height: Option.none(),
        color: Option.some("invalid-color-preset"),
        text: Option.none(),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      const error = await Effect.runPromise(Effect.flip(program));

      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("ノードデータの検証に失敗しました");
    });

    it("更新対象のノード ID がキャンバスに存在しないとき、ノード未検出のエラーが返されること", async () => {
      const state = { current: { ...initialCanvas } };
      const program = updateNodeWorkflow({
        id: "non-existent-node",
        type: "text",
        x: Option.none(),
        y: Option.none(),
        width: Option.none(),
        height: Option.none(),
        color: Option.none(),
        text: Option.none(),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      const error = await Effect.runPromise(Effect.flip(program));

      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("のノードが見つかりませんでした");
    });

    it("更新対象のノードと渡されたパラメータのノードタイプが一致しないとき、タイプ不一致のエラーが返されること", async () => {
      const state = { current: { ...initialCanvas } };
      const program = updateNodeWorkflow({
        id: "node-1", // textノード
        type: "file", // fileノードとして更新しようとする
        x: Option.none(),
        y: Option.none(),
        width: Option.none(),
        height: Option.none(),
        color: Option.none(),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      const error = await Effect.runPromise(Effect.flip(program));

      expect(error._tag).toBe("CanvasError");
      expect(error.message).toContain("は file ノードではありません");
    });
  });
});
