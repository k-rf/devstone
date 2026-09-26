import { type Edge, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

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
    const edges = canvas.edges ?? [];
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

    return {
      ...canvas,
      edges: [...edges.slice(0, index), edge, ...edges.slice(index + 1)],
    };
  });
