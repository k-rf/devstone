import { type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

/**
 * キャンバス内のアイテム情報を一覧表示用にフォーマットする Step
 * @param canvas - フォーマット対象のキャンバスデータ
 * @returns 整形された一覧の文字列を示す Effect
 */
export const formatCanvasItemsStep = (canvas: JsonCanvas) =>
  Effect.sync(() => {
    const nodes = canvas.nodes ?? [];
    const edges = canvas.edges ?? [];

    const nodesOutput = nodes.map((n) => `- ${n.id} [${n.type}]`).join("\n");

    const edgesOutput = edges
      .map((e) => {
        const sideInfo =
          e.fromSide !== undefined || e.toSide !== undefined
            ? ` (${e.fromSide ?? "any"} -> ${e.toSide ?? "any"})`
            : "";
        return `- ${e.id} [${e.fromNode} -> ${e.toNode}]${sideInfo}`;
      })
      .join("\n");

    return ["nodes:", nodesOutput, "edges:", edgesOutput].join("\n");
  });
