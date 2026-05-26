import { JsonCanvas, NodeId } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

import { findNode } from "../../../utils/find-node.js";
import { CanvasError } from "../errors.js";

/**
 * ノードを指定された座標に移動します。
 * オプションで x, y (絶対座標) または dx, dy (相対座標) を受け取ります。
 * @param canvas - キャンバスデータ
 * @param nodeId - 移動するノードの ID
 * @param options - 移動座標オプション
 * @param options.x - 移動先の絶対 X 座標
 * @param options.y - 移動先の絶対 Y 座標
 * @param options.dx - 相対移動する X 方向の距離
 * @param options.dy - 相対移動する Y 方向の距離
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const moveNode = (
  canvas: JsonCanvas,
  nodeId: NodeId,
  options: { x?: number; y?: number; dx?: number; dy?: number },
): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const nodes = canvas.nodes ? [...canvas.nodes] : [];
    const [node, index] = findNode(nodes, nodeId);

    if (node === undefined) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${nodeId}' のノードが見つかりませんでした` }),
      );
    }

    let nextX = node.x;
    let nextY = node.y;

    if (options.x !== undefined) {
      nextX = options.x;
    } else if (options.dx !== undefined) {
      nextX += options.dx;
    }

    if (options.y !== undefined) {
      nextY = options.y;
    } else if (options.dy !== undefined) {
      nextY += options.dy;
    }

    const updatedNode = {
      ...node,
      x: nextX,
      y: nextY,
    };

    return {
      ...canvas,
      nodes: [...nodes.slice(0, index), updatedNode, ...nodes.slice(index + 1)],
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
    it("絶対座標でノードを移動できること", () => {
      const program = moveNode(initialCanvas, NodeId.make("node-1"), { x: 50, y: 60 });
      const result = Effect.runSync(program);
      const node = result.nodes?.find((n) => n.id === "node-1");
      expect(node?.x).toBe(50);
      expect(node?.y).toBe(60);
    });

    it("相対座標でノードを移動できること", () => {
      const program = moveNode(initialCanvas, NodeId.make("node-1"), { dx: 10, dy: -5 });
      const result = Effect.runSync(program);
      const node = result.nodes?.find((n) => n.id === "node-1");
      expect(node?.x).toBe(20);
      expect(node?.y).toBe(15);
    });

    it("座標を指定せずにノードを移動した場合、座標が変わらないこと", () => {
      const program = moveNode(initialCanvas, NodeId.make("node-1"), {});
      const result = Effect.runSync(program);
      const node = result.nodes?.find((n) => n.id === "node-1");
      expect(node?.x).toBe(10);
      expect(node?.y).toBe(20);
    });
  });

  describe("異常系", () => {
    it("存在しないノードの移動はエラーになること", async () => {
      const program = moveNode(initialCanvas, NodeId.make("node-999"), { x: 0 });
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
    });

    it("キャンバスのノード一覧が存在しない状態でノード移動を試みた場合、エラーになること", async () => {
      const noNodesCanvas = Schema.decodeUnknownSync(JsonCanvas)({});
      const program = moveNode(noNodesCanvas, NodeId.make("node-999"), { x: 0 });
      const error = await Effect.runPromise(Effect.flip(program));
      expect(error).toBeInstanceOf(CanvasError);
      expect(error.message).toBe("ID 'node-999' のノードが見つかりませんでした");
    });
  });
}
