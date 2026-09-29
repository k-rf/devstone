import { JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { CanvasError } from "../errors.js";

import { removeNode } from "./remove-node.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvas)({
  nodes: [
    { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
  ],
  edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
});

describe("正常系", () => {
  it("ノードを削除すると、接続されているエッジも追従して削除されること", () => {
    const program = removeNode(initialCanvas, "node-1");
    const result = Effect.runSync(program);
    expect(result.nodes?.length).toBe(1);
    expect(result.nodes?.some((n) => n.id === "node-1")).toBe(false);
    expect(result.edges?.length).toBe(0);
  });
});

describe("異常系", () => {
  it("存在しないノードの削除はエラーになること", async () => {
    const program = removeNode(initialCanvas, "node-999");
    const error = await Effect.runPromise(Effect.flip(program));
    expect(error).toBeInstanceOf(CanvasError);
    expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
  });
});
