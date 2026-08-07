import { JsonCanvas as JsonCanvasSchema } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import {
  makeCanvasRef,
  makeTestCanvasRepository,
} from "../../test-utils/make-test-canvas-repository.js";

import { showCanvasWorkflow } from "./show-canvas.workflow.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvasSchema)({
  nodes: [{ id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" }],
  edges: [],
});

describe("キャンバス生データ取得ワークフロー", () => {
  describe("正常系", () => {
    it("リポジトリに保存されているキャンバスの生データ全体をそのまま取得できること", async () => {
      const state = makeCanvasRef({ ...initialCanvas });
      const program = showCanvasWorkflow().pipe(Effect.provide(makeTestCanvasRepository(state)));

      const result = await Effect.runPromise(program);

      expect(result).toEqual(initialCanvas);
    });
  });
});
