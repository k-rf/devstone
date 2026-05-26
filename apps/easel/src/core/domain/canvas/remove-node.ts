import { JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

import { CanvasError } from "../errors.js";

/**
 * 指定されたノードを削除し、それに接続するすべてのエッジも追従して削除します。
 * ノードが存在しない場合はエラーを返します。
 * @param canvas - キャンバスデータ
 * @param nodeId - 削除するノードの ID
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const removeNode = (
  canvas: JsonCanvas,
  nodeId: string,
): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const nodes = canvas.nodes ? [...canvas.nodes] : [];
    const index = nodes.findIndex((n) => n.id === nodeId);
    if (index === -1) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${nodeId}' のノードが見つかりませんでした` }),
      );
    }
    const filteredNodes = nodes.filter((n) => n.id !== nodeId);
    const edges = canvas.edges ? [...canvas.edges] : [];
    const filteredEdges = edges.filter((e) => e.fromNode !== nodeId && e.toNode !== nodeId);
    return {
      ...canvas,
      nodes: filteredNodes,
      edges: filteredEdges,
    };
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
}
