import { Edge, JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

import { CanvasError } from "../errors.js";

/**
 * キャンバスにエッジを追加します。
 * 接続元および接続先のノードが実在することを確認します。
 * @param canvas - キャンバスデータ
 * @param edge - 追加するエッジデータ
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const addEdge = (canvas: JsonCanvas, edge: Edge): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const nodes = canvas.nodes ?? [];
    const hasFromNode = nodes.some((n) => n.id === edge.fromNode);
    const hasToNode = nodes.some((n) => n.id === edge.toNode);

    if (!hasFromNode) {
      return yield* Effect.fail(
        new CanvasError({
          message: `参照されている接続元ノード '${edge.fromNode}' が見つかりませんでした`,
        }),
      );
    }
    if (!hasToNode) {
      return yield* Effect.fail(
        new CanvasError({
          message: `参照されている接続先ノード '${edge.toNode}' が見つかりませんでした`,
        }),
      );
    }

    const edges = canvas.edges ? [...canvas.edges] : [];
    const index = edges.findIndex((e) => e.id === edge.id);
    if (index === -1) {
      edges.push(edge);
    } else {
      edges[index] = edge;
    }
    return { ...canvas, edges: edges };
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
}
