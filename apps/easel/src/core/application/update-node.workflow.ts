import { Effect, type Option } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { findNodeStep } from "./find-node.step.js";
import { mergeNodeUpdatesStep } from "./merge-node-updates.step.js";
import { readCanvasStep } from "./read-canvas.step.js";
import { validateNodeSchemaStep } from "./validate-node-schema.step.js";
import { validateNodeTypeStep } from "./validate-node-type.step.js";
import { writeCanvasStep } from "./write-canvas.step.js";

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
    const canvas = yield* readCanvasStep();
    const foundNode = yield* findNodeStep(canvas, params.id);
    yield* validateNodeTypeStep(foundNode, params.type);
    const mergedData = yield* mergeNodeUpdatesStep(foundNode, params);
    const validated = yield* validateNodeSchemaStep(mergedData);
    const updatedCanvas = yield* Canvas.updateNode(canvas, validated);
    yield* writeCanvasStep(updatedCanvas);
  });
