import { Effect } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { readCanvasActivity } from "./read-canvas.activity.js";
import { writeCanvasActivity } from "./write-canvas.activity.js";

/**
 * ノードを削除し（関連エッジも含む）、キャンバスを保存する Workflow
 * @param id - 削除するノードの ID
 * @returns 処理完了を示す Effect
 */
export const removeNodeWorkflow = (id: string) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasActivity();
    const updatedCanvas = yield* Canvas.removeNode(canvas, id);
    yield* writeCanvasActivity(updatedCanvas);
  });
