import { JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

import { CanvasError } from "../errors.js";

/**
 * 指定されたエッジを削除します。
 * エッジが存在しない場合はエラーを返します。
 * @param canvas - キャンバスデータ
 * @param edgeId - 削除するエッジの ID
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const removeEdge = (
  canvas: JsonCanvas,
  edgeId: string,
): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const edges = canvas.edges ? [...canvas.edges] : [];
    const index = edges.findIndex((e) => e.id === edgeId);
    if (index === -1) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${edgeId}' のエッジが見つかりませんでした` }),
      );
    }
    const filteredEdges = edges.filter((e) => e.id !== edgeId);
    return { ...canvas, edges: filteredEdges };
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
    it("エッジを削除できること", () => {
      const program = removeEdge(initialCanvas, "edge-1");
      const result = Effect.runSync(program);
      expect(result.edges?.length).toBe(0);
    });
  });

  describe("異常系", () => {
    it("存在しないエッジの削除はエラーになること", async () => {
      const program = removeEdge(initialCanvas, "edge-999");
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'edge-999' のエッジが見つかりませんでした");
    });
  });
}
