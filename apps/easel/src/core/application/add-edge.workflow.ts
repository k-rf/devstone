import { Effect } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { readCanvasStep } from "./read-canvas.step.js";
import { validateEdgeSchemaStep } from "./validate-edge-schema.step.js";
import { writeCanvasStep } from "./write-canvas.step.js";

/**
 * 新しいエッジを検証してキャンバスに追加し、保存する Workflow
 * @param edgeData - 追加する未検証のエッジデータ
 * @returns 追加されたエッジの ID を示す Effect
 */
export const addEdgeWorkflow = (edgeData: unknown) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasStep();
    const validated = yield* validateEdgeSchemaStep(edgeData);
    const updatedCanvas = yield* Canvas.addEdge(canvas, validated);
    yield* writeCanvasStep(updatedCanvas);
    return validated.id;
  });
