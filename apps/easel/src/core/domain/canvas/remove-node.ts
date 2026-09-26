import { type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

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
