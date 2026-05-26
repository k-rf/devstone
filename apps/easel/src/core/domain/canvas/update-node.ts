import { JsonCanvas, Node } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

import { CanvasError } from "../errors.js";

/**
 * 指定されたノードを更新します。
 * ノードが存在しない場合はエラーを返します。
 * @param canvas - キャンバスデータ
 * @param node - 更新するノードデータ
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const updateNode = (
  canvas: JsonCanvas,
  node: Node,
): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const nodes = canvas.nodes ? [...canvas.nodes] : [];
    const index = nodes.findIndex((n) => n.id === node.id);
    if (index === -1) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${node.id}' のノードが見つかりませんでした` }),
      );
    }
    nodes[index] = node;
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
      if (foundNode?.type === "text") {
        expect(foundNode.text).toBe("Updated");
      } else {
        throw new Error("expected text node");
      }
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
}
