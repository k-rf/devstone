import { Schema } from "effect";
import { describe, expect, it } from "vitest";

import { JsonCanvas } from "./json-canvas.js";

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
