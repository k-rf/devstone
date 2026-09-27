import { JsonCanvas, Node } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";
import { expect, it } from "vitest";

import { addNode } from "./add-node.js";

const initialCanvas = Schema.decodeUnknownSync(JsonCanvas)({
  nodes: [
    { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
    { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
  ],
  edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
});

it("新規ノードを追加できること", () => {
  const newNode = Schema.decodeUnknownSync(Node)({
    id: "node-3",
    type: "text",
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    text: "New",
  });
  const program = addNode(initialCanvas, newNode);
  const result = Effect.runSync(program);
  expect(result.nodes?.length).toBe(3);
  expect(result.nodes?.find((n) => n.id === "node-3")).toEqual(newNode);
});

it("既存のノードを上書きできること", () => {
  const updatedNode = Schema.decodeUnknownSync(Node)({
    id: "node-1",
    type: "text",
    x: 15,
    y: 25,
    width: 100,
    height: 50,
    text: "Updated",
  });
  const program = addNode(initialCanvas, updatedNode);
  const result = Effect.runSync(program);
  expect(result.nodes?.length).toBe(2);
  const foundNode = result.nodes?.find((n) => n.id === "node-1");
  expect(foundNode).toBeDefined();
  expect(foundNode).toMatchObject({
    type: "text",
    text: "Updated",
  });
});
