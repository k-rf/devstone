import { Effect, Option } from "effect";

/**
 * Option値から移動座標オプションを抽出する Activity
 * @param options - 座標移動のオプション
 * @param options.x - 移動先の絶対 X 座標
 * @param options.y - 移動先の絶対 Y 座標
 * @param options.dx - 相対移動する X 方向の距離
 * @param options.dy - 相対移動する Y 方向の距離
 * @returns 抽出された座標オプションオブジェクトを示す Effect
 */
export const moveNodeOptionsActivity = (options: {
  readonly x: Option.Option<number>;
  readonly y: Option.Option<number>;
  readonly dx: Option.Option<number>;
  readonly dy: Option.Option<number>;
}) =>
  Effect.sync(() => {
    const xValue = Option.getOrUndefined(options.x);
    const yValue = Option.getOrUndefined(options.y);
    const dxValue = Option.getOrUndefined(options.dx);
    const dyValue = Option.getOrUndefined(options.dy);

    const moveOptions: { x?: number; y?: number; dx?: number; dy?: number } = {};
    if (xValue !== undefined) moveOptions.x = xValue;
    if (yValue !== undefined) moveOptions.y = yValue;
    if (dxValue !== undefined) moveOptions.dx = dxValue;
    if (dyValue !== undefined) moveOptions.dy = dyValue;

    return moveOptions;
  });
