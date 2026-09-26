import { JsonCanvas, Node } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";
import { describe, expect, it } from "vitest";

import { CanvasError } from "../errors.js";

import { updateNode } from "./update-node.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvas)({
  nodes: [
    { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
  ],
  edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
});

describe("正常系", () => {
  it("既存のノードを更新できること", () => {
    const updatedNode = Schema.decodeUnknownSync(Node)({
      id: "node-1",
      type: "text",
      x: 15,
      y: 25,
      width: 100,
      height: 50,
      text: "Updated",
    });
    const program = updateNode(initialCanvas, updatedNode);
    const result = Effect.runSync(program);
    const foundNode = result.nodes?.find((n) => n.id === "node-1");
    expect(foundNode).toBeDefined();
    expect(foundNode).toMatchObject({
      type: "text",
      text: "Updated",
    });
  });
});

describe("異常系", () => {
  it("存在しないノードの更新はエラーになること", async () => {
    const nonExistentNode = Schema.decodeUnknownSync(Node)({
      id: "node-999",
      type: "text",
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      text: "No",
    });
    const program = updateNode(initialCanvas, nonExistentNode);
    const error = await Effect.runPromise(Effect.flip(program));
    expect(error).toBeInstanceOf(CanvasError);
    expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
  });

  it("キャンバスのノード一覧が存在しない状態でノード更新を試みた場合、エラーになること", async () => {
    const noNodesCanvas = Schema.decodeUnknownSync(JsonCanvas)({});
    const nonExistentNode = Schema.decodeUnknownSync(Node)({
      id: "node-999",
      type: "text",
      x: 0,
      y: 0,
      width: 50,
      height: 50,
      text: "No",
    });
    const program = updateNode(noNodesCanvas, nonExistentNode);
    const error = await Effect.runPromise(Effect.flip(program));
    expect(error).toBeInstanceOf(CanvasError);
    expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
  });
});
