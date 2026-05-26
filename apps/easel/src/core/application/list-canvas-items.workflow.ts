import { Effect } from "effect";

import { formatCanvasItemsStep } from "./format-canvas-items.step.js";
import { readCanvasStep } from "./read-canvas.step.js";

/**
 * キャンバスに含まれるすべてのアイテム情報をフォーマットされたテキスト表現で取得する Workflow
 * @returns 整形された一覧の文字列を示す Effect
 */
export const listCanvasItemsWorkflow = () =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasStep();
    return yield* formatCanvasItemsStep(canvas);
  });
