import { type Edge, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

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

    const edges = canvas.edges ?? [];
    const index = edges.findIndex((e) => e.id === edge.id);
    const nextEdges =
      index === -1 ? [...edges, edge] : [...edges.slice(0, index), edge, ...edges.slice(index + 1)];
    return { ...canvas, edges: nextEdges };
  });
