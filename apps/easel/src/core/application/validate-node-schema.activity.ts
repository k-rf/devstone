import { Node as NodeSchema } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

import { CanvasError } from "../domain/errors.js";

/**
 * NodeSchema に基づいてノードの構造を検証する Activity
 * @param nodeData - 検証する未検証のノードデータ
 * @returns 検証済みのノードデータを示す Effect
 */
export const validateNodeSchemaActivity = (nodeData: unknown) =>
  Effect.try({
    try: () => Schema.decodeUnknownSync(NodeSchema)(nodeData),
    catch: (error) =>
      new CanvasError({
        message: `ノードデータの検証に失敗しました: ${(error as Error).message}`,
        cause: error,
      }),
  });
