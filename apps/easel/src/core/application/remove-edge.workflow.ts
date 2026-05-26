import { Effect } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { readCanvasStep } from "./read-canvas.step.js";
import { writeCanvasStep } from "./write-canvas.step.js";

/**
 * エッジを削除し、キャンバスを保存する Workflow
 * @param id - 削除するエッジの ID
 * @returns 処理完了を示す Effect
 */
export const removeEdgeWorkflow = (id: string) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasStep();
    const updatedCanvas = yield* Canvas.removeEdge(canvas, id);
    yield* writeCanvasStep(updatedCanvas);
  });
