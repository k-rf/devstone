import { Effect } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { readCanvasStep } from "./read-canvas.step.js";

/**
 * 指定された ID のキャンバスアイテムを取得する Workflow
 * @param id - 取得したいアイテムの ID
 * @returns 取得されたノードまたはエッジのデータを示す Effect
 */
export const getCanvasItemWorkflow = (id: string) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasStep();
    return yield* Canvas.getCanvasItem(canvas, id);
  });
