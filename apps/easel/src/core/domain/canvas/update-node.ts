import { type JsonCanvas, type Node } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

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
    const nodes = canvas.nodes ?? [];
    const index = nodes.findIndex((n) => n.id === node.id);
    if (index === -1) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${node.id}' のノードが見つかりませんでした` }),
      );
    }
    return {
      ...canvas,
      nodes: [...nodes.slice(0, index), node, ...nodes.slice(index + 1)],
    };
  });
