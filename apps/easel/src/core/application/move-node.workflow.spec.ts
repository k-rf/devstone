import { JsonCanvas as JsonCanvasSchema } from "@devstone/libs-json-canvas-spec";
import { Effect, Option, Schema } from "effect";
import { describe, expect, it } from "vitest";

import {
  getCanvas,
  makeCanvasRef,
  makeTestCanvasRepository,
} from "../../test-utils/make-test-canvas-repository.js";

import { moveNodeWorkflow } from "./move-node.workflow.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvasSchema)({
  nodes: [{ id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" }],
  edges: [],
});

describe("キャンバス内ノードの座標移動ワークフロー", () => {
  describe("正常系", () => {
    it("座標移動のオプション（相対距離など）を渡したとき、対象のノード座標が正しく更新されること", async () => {
      const state = makeCanvasRef({ ...initialCanvas });
      const program = moveNodeWorkflow("node-1", {
        x: Option.none(),
        y: Option.none(),
        dx: Option.some(10),
        dy: Option.some(-5),
      }).pipe(Effect.provide(makeTestCanvasRepository(state)));

      await Effect.runPromise(program);

      const node = getCanvas(state).nodes?.find((n) => n.id === "node-1");

      expect(node?.x).toBe(20);
      expect(node?.y).toBe(15);
    });
  });
});
