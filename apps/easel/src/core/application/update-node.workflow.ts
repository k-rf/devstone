import { Effect, type Option } from "effect";

import * as Canvas from "../domain/canvas/index.js";

import { findNodeActivity } from "./find-node.activity.js";
import { mergeNodeUpdatesActivity } from "./merge-node-updates.activity.js";
import { readCanvasActivity } from "./read-canvas.activity.js";
import { validateNodeSchemaActivity } from "./validate-node-schema.activity.js";
import { validateNodeTypeActivity } from "./validate-node-type.activity.js";
import { writeCanvasActivity } from "./write-canvas.activity.js";

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
    const canvas = yield* readCanvasActivity();
    const foundNode = yield* findNodeActivity(canvas, params.id);
    yield* validateNodeTypeActivity(foundNode, params.type);
    const mergedData = yield* mergeNodeUpdatesActivity(foundNode, params);
    const validated = yield* validateNodeSchemaActivity(mergedData);
    const updatedCanvas = yield* Canvas.updateNode(canvas, validated);
    yield* writeCanvasActivity(updatedCanvas);
  });
