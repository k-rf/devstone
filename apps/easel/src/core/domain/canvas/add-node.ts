import { type JsonCanvas, type Node } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

/**
 * キャンバスにノードを追加または更新します。
 * すでに同一IDのノードが存在する場合は上書きします。
 * @param canvas - キャンバスデータ
 * @param node - 追加または更新するノードデータ
 * @returns 更新されたキャンバスデータを表す Effect
 */
export const addNode = (canvas: JsonCanvas, node: Node): Effect.Effect<JsonCanvas> =>
  Effect.sync(() => {
    const nodes = canvas.nodes ?? [];
    const index = nodes.findIndex((n) => n.id === node.id);
    const nextNodes =
      index === -1 ? [...nodes, node] : [...nodes.slice(0, index), node, ...nodes.slice(index + 1)];
    return { ...canvas, nodes: nextNodes };
  });
