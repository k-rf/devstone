import { Effect } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { readCanvasActivity } from "./read-canvas.activity.js";
import { validateEdgeSchemaActivity } from "./validate-edge-schema.activity.js";
import { writeCanvasActivity } from "./write-canvas.activity.js";

/**
 * 新しいエッジを検証してキャンバスに追加し、保存する Workflow
 * @param edgeData - 追加する未検証のエッジデータ
 * @returns 追加されたエッジの ID を示す Effect
 */
export const addEdgeWorkflow = (edgeData: unknown) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasActivity();
    const validated = yield* validateEdgeSchemaActivity(edgeData);
    const updatedCanvas = yield* Canvas.addEdge(canvas, validated);
    yield* writeCanvasActivity(updatedCanvas);
    return validated.id;
  });
