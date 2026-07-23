import { Edge, JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

import { CanvasError } from "../errors.js";

/**
 * キャンバスのエッジを更新します。
 * 接続元および接続先のノードが実在することを確認します。
 * @param canvas - キャンバスデータ
 * @param edge - 更新するエッジデータ
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const updateEdge = (
  canvas: JsonCanvas,
  edge: Edge,
): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const edges = canvas.edges ? [...canvas.edges] : [];
    const index = edges.findIndex((e) => e.id === edge.id);
    if (index === -1) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${edge.id}' のエッジが見つかりませんでした` }),
      );
    }

    const nodes = canvas.nodes ?? [];
    const fromExists = nodes.some((n) => n.id === edge.fromNode);
    const toExists = nodes.some((n) => n.id === edge.toNode);

    if (!fromExists) {
      return yield* Effect.fail(
        new CanvasError({
          message: `参照されている接続元ノード '${edge.fromNode}' が見つかりませんでした`,
        }),
      );
    }
    if (!toExists) {
      return yield* Effect.fail(
        new CanvasError({
          message: `参照されている接続先ノード '${edge.toNode}' が見つかりませんでした`,
        }),
      );
    }

    edges[index] = edge;
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
    it("エッジを更新できること", () => {
      const updatedEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-1",
        fromNode: "node-1",
        toNode: "node-2",
        color: "3",
        label: "Updated",
      });
      const program = updateEdge(initialCanvas, updatedEdge);
      const result = Effect.runSync(program);
      expect(result.edges?.find((e) => e.id === "edge-1")?.color).toBe("3");
    });
  });

  describe("異常系", () => {
    it("存在しないエッジの更新はエラーになること", async () => {
      const nonExistentEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-999",
        fromNode: "node-1",
        toNode: "node-2",
        color: "1",
      });
      const program = updateEdge(initialCanvas, nonExistentEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'edge-999' のエッジが見つかりませんでした");
    });

    it("接続元ノードが存在しない場合のエッジ更新はエラーになること", async () => {
      const invalidEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-1",
        fromNode: "node-999",
        toNode: "node-2",
        color: "1",
      });
      const program = updateEdge(initialCanvas, invalidEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("参照されている接続元ノード 'node-999' が見つかりませんでした");
    });

    it("接続先ノードが存在しない場合のエッジ更新はエラーになること", async () => {
      const invalidEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-1",
        fromNode: "node-1",
        toNode: "node-999",
        color: "1",
      });
      const program = updateEdge(initialCanvas, invalidEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("参照されている接続先ノード 'node-999' が見つかりませんでした");
    });

    it("キャンバスのエッジ一覧が存在しない状態でエッジ更新を試みた場合、エラーになること", async () => {
      const noEdgesCanvas = Schema.decodeUnknownSync(JsonCanvas)({
        nodes: [
          { id: "node-1", type: "text", x: 10, y: 20, width: 100, height: 50, text: "Node 1" },
        ],
      });
      const someEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-1",
        fromNode: "node-1",
        toNode: "node-2",
        color: "1",
      });
      const program = updateEdge(noEdgesCanvas, someEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'edge-1' のエッジが見つかりませんでした");
    });

    it("キャンバスのノード一覧が存在しない状態でエッジ更新を試みた場合、エラーになること", async () => {
      const noNodesCanvas = Schema.decodeUnknownSync(JsonCanvas)({
        edges: [{ id: "edge-1", fromNode: "node-1", toNode: "node-2", color: "1" }],
      });
      const updatedEdge = Schema.decodeUnknownSync(Edge)({
        id: "edge-1",
        fromNode: "node-1",
        toNode: "node-2",
        color: "1",
      });
      const program = updateEdge(noNodesCanvas, updatedEdge);
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("参照されている接続元ノード 'node-1' が見つかりませんでした");
    });
  });
}
