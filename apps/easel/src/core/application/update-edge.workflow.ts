import { Effect, type Option } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { findEdgeStep } from "./find-edge.step.js";
import { mergeEdgeUpdatesStep } from "./merge-edge-updates.step.js";
import { readCanvasStep } from "./read-canvas.step.js";
import { validateEdgeSchemaStep } from "./validate-edge-schema.step.js";
import { writeCanvasStep } from "./write-canvas.step.js";

/**
 * エッジを更新するための Workflow。
 * 既存のエッジを取得し、データのマージを行った上で保存します。
 * @param params - 更新用のパラメータ
 * @param params.id - 更新対象のエッジ ID
 * @param params.fromNode - 接続元ノード ID
 * @param params.toNode - 接続先ノード ID
 * @param params.fromSide - 接続元の接続面
 * @param params.toSide - 接続先の接続面
 * @param params.fromEnd - 接続元の終端形状
 * @param params.toEnd - 接続先の終端形状
 * @param params.color - エッジの色
 * @param params.label - エッジのラベル
 * @returns 処理完了を示す Effect
 */
export const updateEdgeWorkflow = (params: {
  readonly id: string;
  readonly fromNode: Option.Option<string>;
  readonly toNode: Option.Option<string>;
  readonly fromSide: Option.Option<"top" | "right" | "bottom" | "left">;
  readonly toSide: Option.Option<"top" | "right" | "bottom" | "left">;
  readonly fromEnd: Option.Option<"none" | "arrow">;
  readonly toEnd: Option.Option<"none" | "arrow">;
  readonly color: Option.Option<string>;
  readonly label: Option.Option<string>;
}) =>
  Effect.gen(function* () {
    const canvas = yield* readCanvasStep();
    const foundEdge = yield* findEdgeStep(canvas, params.id);
    const mergedData = yield* mergeEdgeUpdatesStep(foundEdge, params);
    const validated = yield* validateEdgeSchemaStep(mergedData);
    const updatedCanvas = yield* Canvas.updateEdge(canvas, validated);
    yield* writeCanvasStep(updatedCanvas);
  });
