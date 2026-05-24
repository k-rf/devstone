import { Schema } from "effect";

import { Edge } from "./edge/edge.js";
import { Node } from "./node/node.js";

export const JsonCanvas = Schema.Struct({
  nodes: Schema.optional(Schema.Array(Node)),
  edges: Schema.optional(Schema.Array(Edge)),
});

export type JsonCanvas = typeof JsonCanvas.Type;

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("正常系", () => {
    it("空のオブジェクトを正しくデコードできること", () => {
      const data = {};
      const result = Schema.decodeSync(JsonCanvas)(data);
      expect(result).toEqual({});
    });

    it("ノードとエッジを含むキャンバス全体をデコードできること", () => {
      const data = {
        nodes: [
          {
            id: "text-1",
            type: "text" as const,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            text: "hello",
            color: "1" as const,
          },
        ],
        edges: [
          {
            id: "edge-1",
            fromNode: "text-1",
            toNode: "file-1",
            color: "#ff0000" as const,
          },
        ],
      };
      const result = Schema.decodeSync(JsonCanvas)(data);
      expect(result).toEqual(data);
    });
  });
}
