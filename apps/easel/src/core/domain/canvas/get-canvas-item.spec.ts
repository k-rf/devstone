import { JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { CanvasError } from "../errors.js";

import { getCanvasItem } from "./get-canvas-item.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvas)({
  nodes: [
    { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
  ],
  edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
});

describe("正常系", () => {
  it("IDでノードを取得できること", () => {
    const program = getCanvasItem(initialCanvas, "node-1");
    const result = Effect.runSync(program);
    expect(result.type).toBe("node");
    expect(result.data.id).toBe("node-1");
  });

  it("IDでエッジを取得できること", () => {
    const program = getCanvasItem(initialCanvas, "edge-1");
    const result = Effect.runSync(program);
    expect(result.type).toBe("edge");
    expect(result.data.id).toBe("edge-1");
  });
});

describe("異常系", () => {
  it("存在しないIDの取得はエラーになること", async () => {
    const program = getCanvasItem(initialCanvas, "non-existent");
    const error = await Effect.runPromise(Effect.flip(program));
    expect(error).toBeInstanceOf(CanvasError);
    expect(error.message).toBe("ID 'non-existent' を持つノードまたはエッジが見つかりませんでした");
  });
});
