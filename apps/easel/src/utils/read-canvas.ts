import { JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { FileSystem } from "@effect/platform";
import { Effect, Schema } from "effect";

/**
 * 指定されたパスから .canvas ファイルを読み込み、バリデーションして返します。
 * ファイルが存在しない場合は空のキャンバスデータを返します。
 * @param filePath - 読み込むキャンバスファイルのパス。
 * @returns バリデーション済みの JsonCanvas オブジェクト、またはエラーを返す Effect。
 */
export const readCanvas = (
  filePath: string,
): Effect.Effect<JsonCanvas, Error, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const exists = yield* fs
      .exists(filePath)
      .pipe(Effect.mapError((error) => new Error(`ファイル存在確認エラー: ${error.message}`)));

    if (!exists) return { nodes: [], edges: [] };

    const data = yield* fs
      .readFileString(filePath)
      .pipe(Effect.mapError((error) => new Error(`ファイル読み込みエラー: ${error.message}`)));
    const json: unknown = yield* Effect.try({
      try: () => JSON.parse(data) as unknown,
      catch: (error) => new Error(`JSONパースエラー: ${(error as Error).message}`),
    });

    return yield* Effect.try({
      try: () => Schema.decodeUnknownSync(JsonCanvas)(json),
      catch: (error) =>
        new Error(`キャンバスデータのバリデーションエラー: ${(error as Error).message}`),
    });
  });
