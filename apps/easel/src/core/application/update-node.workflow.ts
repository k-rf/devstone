import { Node as NodeSchema } from "@devstone/libs-json-canvas-spec";
import { compact } from "@devstone/libs-util";
import { Effect, Option, Schema } from "effect";

import * as Domain from "../domain/canvas/index.js";
import { CanvasError } from "../domain/errors.js";
import { CanvasRepository } from "../port/repository/canvas.repository.js";

/**
 * ノードを更新するための Workflow。
 * 既存のノードを取得し、タイプ一致の検証とデータのマージを行った上で保存します。
 * @param params - 更新用のパラメータ
 * @param params.id - 更新対象のノード ID
 * @param params.type - 更新対象のノードタイプ
 * @param params.x - 新しい X 座標
 * @param params.y - 新しい Y 座標
 * @param params.width - 新しい幅
 * @param params.height - 新しい高さ
 * @param params.color - 新しい色
 * @param params.text - 新しいテキスト（Textノード用）
 * @param params.fileRef - 新しいファイルパス（Fileノード用）
 * @param params.url - 新しいURL（Linkノード用）
 * @param params.label - 新しいラベル（Groupノード用）
 * @returns 処理完了を示す Effect
 */
export const updateNodeWorkflow = (params: {
  readonly id: string;
  readonly type: "text" | "file" | "link" | "group";
  readonly x: Option.Option<number>;
  readonly y: Option.Option<number>;
  readonly width: Option.Option<number>;
  readonly height: Option.Option<number>;
  readonly color: Option.Option<string>;
  readonly text?: Option.Option<string>;
  readonly fileRef?: Option.Option<string>;
  readonly url?: Option.Option<string>;
  readonly label?: Option.Option<string>;
}) =>
  Effect.gen(function* () {
    const repo = yield* CanvasRepository;
    const canvas = yield* repo.read();

    // Step 1: 既存のノードを取得
    const foundNode = canvas.nodes?.find((n) => n.id === params.id);
    if (foundNode === undefined) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${params.id}' のノードが見つかりませんでした` }),
      );
    }

    // Step 2: 意味論的バリデーション (タイプの不一致チェック)
    if (foundNode.type !== params.type) {
      return yield* Effect.fail(
        new CanvasError({ message: `ID '${params.id}' は ${params.type} ノードではありません` }),
      );
    }

    // Step 3: updates を compact にしてマージ
    const rawUpdates = {
      x: Option.getOrUndefined(params.x),
      y: Option.getOrUndefined(params.y),
      width: Option.getOrUndefined(params.width),
      height: Option.getOrUndefined(params.height),
      color: Option.getOrUndefined(params.color),
      text: params.text ? Option.getOrUndefined(params.text) : undefined,
      file: params.fileRef ? Option.getOrUndefined(params.fileRef) : undefined,
      url: params.url ? Option.getOrUndefined(params.url) : undefined,
      label: params.label ? Option.getOrUndefined(params.label) : undefined,
    };
    const updates = compact(rawUpdates);
    const nodeData = {
      ...foundNode,
      ...updates,
    };

    // Step 4: バリデーション & ドメインでの更新
    const validated = yield* Effect.try({
      try: () => Schema.decodeUnknownSync(NodeSchema)(nodeData),
      catch: (error) =>
        new CanvasError({
          message: `ノードデータの検証に失敗しました: ${(error as Error).message}`,
          cause: error,
        }),
    });

    const updatedCanvas = yield* Domain.updateNode(canvas, validated);
    yield* repo.write(updatedCanvas);
  });
