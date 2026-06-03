import { type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

import { CanvasError } from "../domain/errors.js";

/**
 * キャンバス内から ID でノードを検索する Activity。
 * ノードが見つからない場合は CanvasError を返します。
 * @param canvas - 検索対象のキャンバスデータ
 * @param id - 検索対象のノード ID
 * @returns 見つかったノードオブジェクトを示す Effect
 */
export const findNodeActivity = (canvas: JsonCanvas, id: string) =>
  Effect.gen(function* () {
    const foundNode = canvas.nodes?.find((n) => n.id === id);
    if (foundNode === undefined) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${id}' のノードが見つかりませんでした` }),
      );
    }
    return foundNode;
  });
