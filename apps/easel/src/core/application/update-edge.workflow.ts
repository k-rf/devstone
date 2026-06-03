import { Effect, type Option } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { findEdgeActivity } from "./find-edge.activity.js";
import { mergeEdgeUpdatesActivity } from "./merge-edge-updates.activity.js";
import { readCanvasActivity } from "./read-canvas.activity.js";
import { validateEdgeSchemaActivity } from "./validate-edge-schema.activity.js";
import { writeCanvasActivity } from "./write-canvas.activity.js";

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
    const canvas = yield* readCanvasActivity();
    const foundEdge = yield* findEdgeActivity(canvas, params.id);
    const mergedData = yield* mergeEdgeUpdatesActivity(foundEdge, params);
    const validated = yield* validateEdgeSchemaActivity(mergedData);
    const updatedCanvas = yield* Canvas.updateEdge(canvas, validated);
    yield* writeCanvasActivity(updatedCanvas);
  });
