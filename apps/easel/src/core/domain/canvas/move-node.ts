import { type JsonCanvas, type NodeId } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

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
  options: { readonly x?: number; readonly y?: number; readonly dx?: number; readonly dy?: number },
): Effect.Effect<JsonCanvas, CanvasError> =>
  Effect.gen(function* () {
    const nodes = canvas.nodes ? [...canvas.nodes] : [];
    const [node, index] = findNode(nodes, nodeId);

    if (node === undefined) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${nodeId}' のノードが見つかりませんでした` }),
      );
    }

    const resolveCoordinate = (
      absolute: number | undefined,
      relative: number | undefined,
      current: number,
    ): number => {
      if (absolute !== undefined) return absolute;

      if (relative !== undefined) return current + relative;

      return current;
    };

    const nextX = resolveCoordinate(options.x, options.dx, node.x);
    const nextY = resolveCoordinate(options.y, options.dy, node.y);

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
