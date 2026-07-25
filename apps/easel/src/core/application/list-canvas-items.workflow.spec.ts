import { JsonCanvas as JsonCanvasSchema } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import {
  makeCanvasRef,
  makeTestCanvasRepository,
} from "../../test-utils/make-test-canvas-repository.js";

import { listCanvasItemsWorkflow } from "./list-canvas-items.workflow.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvasSchema)({
  nodes: [
    { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
  ],
  edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
});

describe("キャンバスアイテム一覧をフォーマット出力するワークフロー", () => {
  describe("正常系", () => {
    it("キャンバス内のすべてのノードとエッジが整形された文字列として取得できること", async () => {
      const state = makeCanvasRef({ ...initialCanvas });
      const program = listCanvasItemsWorkflow().pipe(
        Effect.provide(makeTestCanvasRepository(state)),
      );

      const result = await Effect.runPromise(program);

      expect(result).toContain("nodes:");
      expect(result).toContain("- node-1 [text]");
      expect(result).toContain("- node-2 [file]");
      expect(result).toContain("edges:");
      expect(result).toContain("- edge-1 [node-1 -> node-2]");
    });
  });
});
