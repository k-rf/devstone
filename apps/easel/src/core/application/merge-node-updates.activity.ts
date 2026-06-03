import { type Node } from "@devstone/libs-json-canvas-spec";
import { compact } from "@devstone/libs-util";
import { Effect, Option } from "effect";

/**
 * 既存のノードに新しいパラメータをマージする Activity
 * @param node - 既存のノードオブジェクト
 * @param params - 更新用のパラメータ
 * @param params.x - 新しい X 座標
 * @param params.y - 新しい Y 座標
 * @param params.width - 新しい幅
 * @param params.height - 新しい高さ
 * @param params.color - 新しい色
 * @param params.text - 新しいテキスト（Textノード用）
 * @param params.fileRef - 新しいファイルパス（Fileノード用）
 * @param params.url - 新しいURL（Linkノード用）
 * @param params.label - 新しいラベル（Groupノード用）
 * @returns パラメータがマージされた新しいノードデータを示す Effect
 */
export const mergeNodeUpdatesActivity = (
  node: Node,
  params: {
    readonly x: Option.Option<number>;
    readonly y: Option.Option<number>;
    readonly width: Option.Option<number>;
    readonly height: Option.Option<number>;
    readonly color: Option.Option<string>;
    readonly text?: Option.Option<string>;
    readonly fileRef?: Option.Option<string>;
    readonly url?: Option.Option<string>;
    readonly label?: Option.Option<string>;
  },
) =>
  Effect.sync(() => {
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
    return {
      ...node,
      ...updates,
    };
  });
