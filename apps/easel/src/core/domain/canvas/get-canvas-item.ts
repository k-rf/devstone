import { JsonCanvas, type Edge, type Node } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

import { CanvasError } from "../errors.js";

/**
 * ID で指定されたノードまたはエッジを取得します。
 * @param canvas - キャンバスデータ
 * @param id - 取得するアイテムの ID
 * @returns 取得されたアイテムのデータを表す Effect
 */
export const getCanvasItem = (
  canvas: JsonCanvas,
  id: string,
): Effect.Effect<
  { readonly type: "node"; readonly data: Node } | { readonly type: "edge"; readonly data: Edge },
  CanvasError
> =>
  Effect.gen(function* () {
    const nodes = canvas.nodes ?? [];
    const foundNode = nodes.find((n) => n.id === id);
    if (foundNode !== undefined) {
      return { type: "node" as const, data: foundNode };
    }

    const edges = canvas.edges ?? [];
    const foundEdge = edges.find((e) => e.id === id);
    if (foundEdge !== undefined) {
      return { type: "edge" as const, data: foundEdge };
    }

    return yield* Effect.fail(
      new CanvasError({ message: `ID '${id}' を持つノードまたはエッジが見つかりませんでした` }),
    );
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
    it("IDでノードを取得できること", () => {
      const program = getCanvasItem(initialCanvas, "node-1");
      const result = Effect.runSync(program);
      expect(result.type).toBe("node");
      expect(result.data.id).toBe("node-1");
    });

    it("IDでエッジを取得できること", () => {
      const program = getCanvasItem(initialCanvas, "edge-1");
      const result = Effect.runSync(program);
      expect(result.type).toBe("edge");
      expect(result.data.id).toBe("edge-1");
    });
  });

  describe("異常系", () => {
    it("存在しないIDの取得はエラーになること", async () => {
      const program = getCanvasItem(initialCanvas, "non-existent");
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe(
        "ID 'non-existent' を持つノードまたはエッジが見つかりませんでした",
      );
    });
  });
}
