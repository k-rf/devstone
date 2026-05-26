import { Effect } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { readCanvasStep } from "./read-canvas.step.js";
import { validateNodeSchemaStep } from "./validate-node-schema.step.js";
import { writeCanvasStep } from "./write-canvas.step.js";

/**
 * 新しいノードを検証してキャンバスに追加し、保存する Workflow
 * @param nodeData - 追加する未検証のノードデータ
 * @returns 追加されたノードの ID を示す Effect
 */
export const addNodeWorkflow = (nodeData: unknown) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasStep();
    const validated = yield* validateNodeSchemaStep(nodeData);
    const updatedCanvas = yield* Canvas.addNode(canvas, validated);
    yield* writeCanvasStep(updatedCanvas);
    return validated.id;
  });
