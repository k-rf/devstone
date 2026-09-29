import { Edge, JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { CanvasError } from "../errors.js";

import { addEdge } from "./add-edge.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvas)({
  nodes: [
    { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
  ],
  edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
});

describe("正常系", () => {
  it("接続元と接続先が両方存在する場合、エッジを追加できること", () => {
    const newEdge = Schema.decodeUnknownSync(Edge)({
      id: "edge-2",
      fromNode: "node-2",
      toNode: "node-1",
      color: "2",
    });
    const program = addEdge(initialCanvas, newEdge);
    const result = Effect.runSync(program);
    expect(result.edges?.length).toBe(2);
    expect(result.edges?.find((e) => e.id === "edge-2")).toEqual(newEdge);
  });

  it("既存のエッジIDを指定して追加した場合、上書きされること", () => {
    const updatedEdge = Schema.decodeUnknownSync(Edge)({
      id: "edge-1",
      fromNode: "node-1",
      toNode: "node-2",
      color: "4",
    });
    const program = addEdge(initialCanvas, updatedEdge);
    const result = Effect.runSync(program);
    expect(result.edges?.length).toBe(1);
    expect(result.edges?.find((e) => e.id === "edge-1")?.color).toBe("4");
  });
});

describe("異常系", () => {
  it("接続元ノードが存在しない場合のエッジ追加はエラーになること", async () => {
    const invalidEdge = Schema.decodeUnknownSync(Edge)({
      id: "edge-2",
      fromNode: "node-999",
      toNode: "node-2",
      color: "1",
    });
    const program = addEdge(initialCanvas, invalidEdge);
    const error = await Effect.runPromise(Effect.flip(program));
    expect(error).toBeInstanceOf(CanvasError);
    expect(error.message).toBe("参照されている接続元ノード 'node-999' が見つかりませんでした");
  });

  it("接続先ノードが存在しない場合のエッジ追加はエラーになること", async () => {
    const invalidEdge = Schema.decodeUnknownSync(Edge)({
      id: "edge-2",
      fromNode: "node-1",
      toNode: "node-999",
      color: "1",
    });
    const program = addEdge(initialCanvas, invalidEdge);
    const error = await Effect.runPromise(Effect.flip(program));
    expect(error).toBeInstanceOf(CanvasError);
    expect(error.message).toBe("参照されている接続先ノード 'node-999' が見つかりませんでした");
  });
});
