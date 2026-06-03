import { Edge as EdgeSchema } from "@devstone/libs-json-canvas-spec";
import { Effect, Schema } from "effect";

import { CanvasError } from "../domain/errors.js";

/**
 * EdgeSchema に基づいてエッジの構造を検証する Activity
 * @param edgeData - 検証する未検証のエッジデータ
 * @returns 検証済みのエッジデータを示す Effect
 */
export const validateEdgeSchemaActivity = (edgeData: unknown) =>
  Effect.try({
    try: () => Schema.decodeUnknownSync(EdgeSchema)(edgeData),
    catch: (error) =>
      new CanvasError({
        message: `エッジデータの検証に失敗しました: ${(error as Error).message}`,
        cause: error,
      }),
  });
