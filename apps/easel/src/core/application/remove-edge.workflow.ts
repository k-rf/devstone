import { Effect } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { readCanvasActivity } from "./read-canvas.activity.js";
import { writeCanvasActivity } from "./write-canvas.activity.js";

/**
 * エッジを削除し、キャンバスを保存する Workflow
 * @param id - 削除するエッジの ID
 * @returns 処理完了を示す Effect
 */
export const removeEdgeWorkflow = (id: string) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasActivity();
    const updatedCanvas = yield* Canvas.removeEdge(canvas, id);
    yield* writeCanvasActivity(updatedCanvas);
  });
