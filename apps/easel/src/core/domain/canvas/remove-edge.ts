import { type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

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
