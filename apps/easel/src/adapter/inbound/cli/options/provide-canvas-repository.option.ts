import { Effect, Layer } from "effect";

import { CanvasFileConfig } from "../../../repository/canvas-file-config.repository.js";
import { CanvasFileRepository } from "../../../repository/canvas.file.repository.js";

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
