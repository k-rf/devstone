import { NodeId } from "@devstone/libs-json-canvas-spec";
import { Effect, type Option } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { moveNodeOptionsActivity } from "./move-node-options.activity.js";
import { readCanvasActivity } from "./read-canvas.activity.js";
import { writeCanvasActivity } from "./write-canvas.activity.js";

/**
 * ノードを移動するための Workflow。
 * @param id - 移動対象のノード ID
 * @param options - 移動座標オプション
 * @param options.x - 移動先の絶対 X 座標
 * @param options.y - 移動先の絶対 Y 座標
 * @param options.dx - 相対移動する X 方向の距離
 * @param options.dy - 相対移動する Y 方向の距離
 * @returns 処理完了を示す Effect
 */
export const moveNodeWorkflow = (
  id: string,
  options: {
    readonly x: Option.Option<number>;
    readonly y: Option.Option<number>;
    readonly dx: Option.Option<number>;
    readonly dy: Option.Option<number>;
  },
) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasActivity();
    const moveOptions = yield* moveNodeOptionsActivity(options);
    const updatedCanvas = yield* Canvas.moveNode(canvas, NodeId.make(id), moveOptions);
    yield* writeCanvasActivity(updatedCanvas);
  });
