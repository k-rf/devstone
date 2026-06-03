import { maybe } from "@devstone/libs-util";
import { Effect, Option } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { readCanvasActivity } from "./read-canvas.activity.js";
import { writeCanvasActivity } from "./write-canvas.activity.js";

/**
 * キャンバス内のノードの重なりを解消（再配置）するための Workflow。
 * @param options - 再配置オプション
 * @param options.padding - ノード間の最小余白 (Option)
 * @param options.maxIterations - 重なり解消の最大ループ回数 (Option)
 * @param options.damping - 移動にかける減衰係数 (Option)
 * @returns 処理完了を示す Effect
 */
export const rearrangeNodesWorkflow = (options: {
  readonly padding: Option.Option<number>;
  readonly maxIterations: Option.Option<number>;
  readonly damping: Option.Option<number>;
}) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasActivity();
    const padding = Option.getOrUndefined(options.padding);
    const maxIterations = Option.getOrUndefined(options.maxIterations);
    const damping = Option.getOrUndefined(options.damping);

    const config = {
      ...maybe({ padding: padding }),
      ...maybe({ maxIterations: maxIterations }),
      ...maybe({ damping: damping }),
    };

    const updatedCanvas = yield* Canvas.rearrangeNodes(canvas, config);

    yield* writeCanvasActivity(updatedCanvas);
  });
