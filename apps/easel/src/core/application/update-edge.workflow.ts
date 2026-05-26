import { Edge as EdgeSchema } from "@devstone/libs-json-canvas-spec";
import { compact } from "@devstone/libs-util";
import { Effect, Option, Schema } from "effect";

import * as Domain from "../domain/canvas/index.js";
import { CanvasError } from "../domain/errors.js";
import { CanvasRepository } from "../port/repository/canvas.repository.js";

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
    const repo = yield* CanvasRepository;
    const canvas = yield* repo.read();

    // Step 1: 既存のエッジを取得
    const foundEdge = canvas.edges?.find((e) => e.id === params.id);
    if (foundEdge === undefined) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${params.id}' のエッジが見つかりませんでした` }),
      );
    }

    // Step 2: updates を compact にしてマージ
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
    const edgeData = {
      ...foundEdge,
      ...updates,
    };

    // Step 3: バリデーション & ドメインでの更新
    const validated = yield* Effect.try({
      try: () => Schema.decodeUnknownSync(EdgeSchema)(edgeData),
      catch: (error) =>
        new CanvasError({
          message: `エッジデータの検証に失敗しました: ${(error as Error).message}`,
          cause: error,
        }),
    });

    const updatedCanvas = yield* Domain.updateEdge(canvas, validated);
    yield* repo.write(updatedCanvas);
  });
