import { Node, type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { type FileSystem } from "@effect/platform";
import { Effect, Schema } from "effect";

import { writeCanvas } from "./write-canvas.js";

/**
 * キャンバスにノードを追加または更新し、ファイルに書き込みます。
 * @param file - 書き込み先キャンバスファイルのパス。
 * @param canvas - 現在のキャンバスデータ。
 * @param nodeData - 追加または更新するノードの未検証データ。
 * @returns 処理を実行する Effect。
 */
export const upsertNode = (
  file: string,
  canvas: JsonCanvas,
  nodeData: unknown,
): Effect.Effect<void, Error, FileSystem.FileSystem> => {
  return Effect.try({
    try: () => Schema.decodeUnknownSync(Node)(nodeData),
    catch: (error) => new Error(`ノードデータの検証に失敗しました: ${(error as Error).message}`),
  }).pipe(
    Effect.flatMap((validatedNode) => {
      const nodes = canvas.nodes ? [...canvas.nodes] : [];
      const index = nodes.findIndex((n) => n.id === validatedNode.id);

      if (index === -1) {
        nodes.push(validatedNode);
      } else {
        nodes[index] = validatedNode;
      }

      const updatedCanvas: JsonCanvas = {
        ...canvas,
        nodes: nodes,
      };

      return writeCanvas(file, updatedCanvas);
    }),
  );
};
