import { type Edge, type JsonCanvas, type Node } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

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
