import { Effect } from "effect";

import { formatCanvasItemsActivity } from "./format-canvas-items.activity.js";
import { readCanvasActivity } from "./read-canvas.activity.js";

/**
 * キャンバスに含まれるすべてのアイテム情報をフォーマットされたテキスト表現で取得する Workflow
 * @returns 整形された一覧の文字列を示す Effect
 */
export const listCanvasItemsWorkflow = () =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasActivity();
    return yield* formatCanvasItemsActivity(canvas);
  });
