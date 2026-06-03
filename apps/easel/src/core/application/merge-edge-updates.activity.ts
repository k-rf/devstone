import { type Edge } from "@devstone/libs-json-canvas-spec";
import { compact } from "@devstone/libs-util";
import { Effect, Option } from "effect";

/**
 * 既存のエッジに新しいパラメータをマージする Activity
 * @param edge - 既存のエッジオブジェクト
 * @param params - 更新用のパラメータ
 * @param params.fromNode - 接続元ノード ID
 * @param params.toNode - 接続先ノード ID
 * @param params.fromSide - 接続元の接続面
 * @param params.toSide - 接続先の接続面
 * @param params.fromEnd - 接続元の終端形状
 * @param params.toEnd - 接続先の終端形状
 * @param params.color - エッジの色
 * @param params.label - エッジのラベル
 * @returns パラメータがマージされた新しいエッジデータを示す Effect
 */
export const mergeEdgeUpdatesActivity = (
  edge: Edge,
  params: {
    readonly fromNode: Option.Option<string>;
    readonly toNode: Option.Option<string>;
    readonly fromSide: Option.Option<"top" | "right" | "bottom" | "left">;
    readonly toSide: Option.Option<"top" | "right" | "bottom" | "left">;
    readonly fromEnd: Option.Option<"none" | "arrow">;
    readonly toEnd: Option.Option<"none" | "arrow">;
    readonly color: Option.Option<string>;
    readonly label: Option.Option<string>;
  },
) =>
  Effect.sync(() => {
    const rawUpdates = {
      fromNode: Option.getOrUndefined(params.fromNode),
      toNode: Option.getOrUndefined(params.toNode),
      fromSide: Option.getOrUndefined(params.fromSide),
      toSide: Option.getOrUndefined(params.toSide),
      fromEnd: Option.getOrUndefined(params.fromEnd),
      toEnd: Option.getOrUndefined(params.toEnd),
      color: Option.getOrUndefined(params.color),
      label: Option.getOrUndefined(params.label),
    };
    const updates = compact(rawUpdates);
    return {
      ...edge,
      ...updates,
    };
  });
