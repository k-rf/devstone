import { Options } from "@effect/cli";
import { Effect, Layer } from "effect";

import {
  CanvasFileConfig,
  CanvasFileRepository,
} from "../../../repository/canvas.file.repository.js";

/**
 * .canvas ファイルへのパスを指定する共通オプション。
 */
export const fileOption = Options.file("file").pipe(
  Options.withAlias("f"),
  Options.withDescription("Path to the JSON-Canvas file"),
  Options.withDefault("canvas.canvas"),
);

/**
 * ファイルパスに基づいて CanvasFileRepository と CanvasFileConfig レイヤーを提供するヘルパー。
 * @param filePath - 読み書き対象となる JSON-Canvas ファイルのパス
 * @returns 依存レイヤーを注入する Effect パイプ用関数
 */
export const provideCanvasRepository =
  (filePath: string) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    effect.pipe(
      Effect.provide(CanvasFileRepository),
      Effect.provide(Layer.succeed(CanvasFileConfig, { filePath: filePath })),
    );
