import type { JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { FileSystem } from "@effect/platform";
import { Effect } from "effect";

/**
 * バリデーションを実行した上で、指定されたパスの .canvas ファイルにデータを書き込みます。
 * @param filePath - 書き込み先キャンバスファイルのパス。
 * @param canvas - 保存する JSON-Canvas データ。
 * @returns 書き込み完了時に void、またはエラーを返す Effect。
 */
export const writeCanvas = (
  filePath: string,
  canvas: JsonCanvas,
): Effect.Effect<void, Error, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    yield* fs
      .writeFileString(filePath, JSON.stringify(canvas, undefined, 2))
      .pipe(Effect.mapError((error) => new Error(`ファイル書き込みエラー: ${error.message}`)));
  });
