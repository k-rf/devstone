import { JsonCanvas as JsonCanvasSchema } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import {
  getCanvas,
  makeCanvasRef,
  makeTestCanvasRepository,
} from "../../test-utils/make-test-canvas-repository.js";

import { removeEdgeWorkflow } from "./remove-edge.workflow.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvasSchema)({
  nodes: [
    { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
  ],
  edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
});

describe("キャンバスからのエッジ削除ワークフロー", () => {
  describe("正常系", () => {
    it("指定された ID のエッジがキャンバスから正常に削除されること", async () => {
      const state = makeCanvasRef({ ...initialCanvas });
      const program = removeEdgeWorkflow("edge-1").pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      await Effect.runPromise(program);

      expect(getCanvas(state).edges?.length).toBe(0);
    });
  });
});
