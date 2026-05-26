import { Effect } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { readCanvasStep } from "./read-canvas.step.js";
import { writeCanvasStep } from "./write-canvas.step.js";

/**
 * ノードを削除し（関連エッジも含む）、キャンバスを保存する Workflow
 * @param id - 削除するノードの ID
 * @returns 処理完了を示す Effect
 */
export const removeNodeWorkflow = (id: string) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasStep();
    const updatedCanvas = yield* Canvas.removeNode(canvas, id);
    yield* writeCanvasStep(updatedCanvas);
  });
