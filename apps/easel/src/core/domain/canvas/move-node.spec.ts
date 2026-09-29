import { JsonCanvas, NodeId } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { CanvasError } from "../errors.js";

import { moveNode } from "./move-node.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvas)({
  nodes: [
    { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
  ],
  edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
});

describe("正常系", () => {
  it("絶対座標でノードを移動できること", () => {
    const program = moveNode(initialCanvas, NodeId.make("node-1"), { x: 50, y: 60 });
    const result = Effect.runSync(program);
    const node = result.nodes?.find((n) => n.id === "node-1");
    expect(node?.x).toBe(50);
    expect(node?.y).toBe(60);
  });

  it("相対座標でノードを移動できること", () => {
    const program = moveNode(initialCanvas, NodeId.make("node-1"), { dx: 10, dy: -5 });
    const result = Effect.runSync(program);
    const node = result.nodes?.find((n) => n.id === "node-1");
    expect(node?.x).toBe(20);
    expect(node?.y).toBe(15);
  });

  it("座標を指定せずにノードを移動した場合、座標が変わらないこと", () => {
    const program = moveNode(initialCanvas, NodeId.make("node-1"), {});
    const result = Effect.runSync(program);
    const node = result.nodes?.find((n) => n.id === "node-1");
    expect(node?.x).toBe(10);
    expect(node?.y).toBe(20);
  });
});

describe("異常系", () => {
  it("存在しないノードの移動はエラーになること", async () => {
    const program = moveNode(initialCanvas, NodeId.make("node-999"), { x: 0 });
    const error = await Effect.runPromise(Effect.flip(program));
    expect(error).toBeInstanceOf(CanvasError);
    expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
  });

  it("キャンバスのノード一覧が存在しない状態でノード移動を試みた場合、エラーになること", async () => {
    const noNodesCanvas = Schema.decodeUnknownSync(JsonCanvas)({});
    const program = moveNode(noNodesCanvas, NodeId.make("node-999"), { x: 0 });
    const error = await Effect.runPromise(Effect.flip(program));
    expect(error).toBeInstanceOf(CanvasError);
    expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
  });
});
