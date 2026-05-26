import { JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { FileSystem } from "@effect/platform";
import { Context, Effect, Layer, Schema } from "effect";

import { CanvasError } from "../../core/domain/errors.js";
import { CanvasRepository } from "../../core/port/repository/canvas.repository.js";

/**
 * ファイルシステムリポジトリ固有の設定情報を保持する Tag。
 */
export class CanvasFileConfig extends Context.Tag("CanvasFileConfig")<
  CanvasFileConfig,
  {
    readonly filePath: string;
  }
>() {}

/**
 * FileSystem を使ってキャンバスファイルの読み書きを行う、CanvasRepository の実装 Layer。
 */
export const CanvasFileRepository = Layer.effect(
  CanvasRepository,
  Effect.gen(function* () {
    const config = yield* CanvasFileConfig;
    const fs = yield* FileSystem.FileSystem;

    return {
      read: () =>
        Effect.gen(function* () {
          const exists = yield* fs.exists(config.filePath).pipe(
            Effect.mapError(
              (error) =>
                new CanvasError({
                  message: `ファイル存在確認エラー: ${error.message}`,
                  cause: error,
                }),
            ),
          );

          if (!exists) {
            return { nodes: [], edges: [] };
          }

          const data = yield* fs.readFileString(config.filePath).pipe(
            Effect.mapError(
              (error) =>
                new CanvasError({
                  message: `ファイル読み込みエラー: ${error.message}`,
                  cause: error,
                }),
            ),
          );

          const json = yield* Effect.try({
            try: () => JSON.parse(data) as unknown,
            catch: (error) =>
              new CanvasError({
                message: `JSONパースエラー: ${(error as Error).message}`,
                cause: error,
              }),
          });

          return yield* Effect.try({
            try: () => Schema.decodeUnknownSync(JsonCanvas)(json),
            catch: (error) =>
              new CanvasError({
                message: `キャンバスデータのバリデーションエラー: ${(error as Error).message}`,
                cause: error,
              }),
          });
        }),

      write: (canvas) =>
        Effect.gen(function* () {
          yield* fs.writeFileString(config.filePath, JSON.stringify(canvas, undefined, 2)).pipe(
            Effect.mapError(
              (error) =>
                new CanvasError({
                  message: `ファイル書き込みエラー: ${error.message}`,
                  cause: error,
                }),
            ),
          );
        }),
    };
  }),
);
