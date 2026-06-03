import { Effect } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { readCanvasActivity } from "./read-canvas.activity.js";

/**
 * 指定された ID のキャンバスアイテムを取得する Workflow
 * @param id - 取得したいアイテムの ID
 * @returns 取得されたノードまたはエッジのデータを示す Effect
 */
export const getCanvasItemWorkflow = (id: string) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasActivity();
    return yield* Canvas.getCanvasItem(canvas, id);
  });
