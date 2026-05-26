import { NodeId } from "@devstone/libs-json-canvas-spec";
import { Effect, Option } from "effect";

import * as Domain from "../domain/canvas/index.js";
import { CanvasRepository } from "../port/repository/canvas.repository.js";

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
    const repo = yield* CanvasRepository;
    const canvas = yield* repo.read();

    const xValue = Option.getOrUndefined(options.x);
    const yValue = Option.getOrUndefined(options.y);
    const dxValue = Option.getOrUndefined(options.dx);
    const dyValue = Option.getOrUndefined(options.dy);

    const moveOptions: { x?: number; y?: number; dx?: number; dy?: number } = {};
    if (xValue !== undefined) moveOptions.x = xValue;
    if (yValue !== undefined) moveOptions.y = yValue;
    if (dxValue !== undefined) moveOptions.dx = dxValue;
    if (dyValue !== undefined) moveOptions.dy = dyValue;

    const updatedCanvas = yield* Domain.moveNode(canvas, NodeId.make(id), moveOptions);
    yield* repo.write(updatedCanvas);
  });
