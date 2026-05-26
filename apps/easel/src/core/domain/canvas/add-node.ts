import { JsonCanvas, Node } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

/**
 * キャンバスにノードを追加または更新します。
 * すでに同一IDのノードが存在する場合は上書きします。
 * @param canvas - キャンバスデータ
 * @param node - 追加または更新するノードデータ
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const addNode = (canvas: JsonCanvas, node: Node): Effect.Effect<JsonCanvas> =>
  Effect.sync(() => {
    const nodes = canvas.nodes ? [...canvas.nodes] : [];
    const index = nodes.findIndex((n) => n.id === node.id);
    if (index === -1) {
      nodes.push(node);
    } else {
      nodes[index] = node;
    }
    return { ...canvas, nodes: nodes };
  });

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  const initialCanvas = Schema.decodeUnknownSync(JsonCanvas)({
    nodes: [
      { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
      { id: "node-2", type: "file", x: 200, y: 20, width: 100, height: 50, file: "doc.md" },
    ],
    edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
  });

  describe("正常系", () => {
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
      if (foundNode?.type === "text") {
        expect(foundNode.text).toBe("Updated");
      } else {
        throw new Error("expected text node");
      }
    });
  });
}
