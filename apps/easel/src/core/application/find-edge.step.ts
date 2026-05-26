import { type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

import { CanvasError } from "../domain/errors.js";

/**
 * キャンバス内から ID でエッジを検索する Step。
 * エッジが見つからない場合は CanvasError を返します。
 * @param canvas - 検索対象のキャンバスデータ
 * @param id - 検索対象のエッジ ID
 * @returns 見つかったエッジオブジェクトを示す Effect
 */
export const findEdgeStep = (canvas: JsonCanvas, id: string) =>
  Effect.gen(function* () {
    const foundEdge = canvas.edges?.find((e) => e.id === id);
    if (foundEdge === undefined) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${id}' のエッジが見つかりませんでした` }),
      );
    }
    return foundEdge;
  });
