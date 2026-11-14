import { JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { FileSystem } from "@effect/platform";
import { Effect, Layer, Schema } from "effect";

import { CanvasError } from "../../core/domain/errors.js";
import { CanvasRepository } from "../../core/port/repository/canvas.repository.js";

/**
 * 配列プロパティをカスタムフォーマットで JSON 文字列化する。
 * 各要素は 1 行で出力され、要素が無い場合は "[]" を返す。
 * @param key - プロパティのキー名
 * @param items - シリアライズ対象の要素配列
 * @returns フォーマットされたプロパティ文字列
 */
const formatArrayProperty = (key: string, items: readonly unknown[]): string => {
  const content =
    items.length === 0
      ? "[]"
      : ["[", items.map((item) => `    ${JSON.stringify(item)}`).join(",\n"), "  ]"].join("\n");

  return `  "${key}": ${content}`;
};

/**
 * キャンバスデータを JSON 形式の文字列に変換する。
 * nodes と edges の各要素は1行で出力される。
 * @param canvas - 変換対象のキャンバスデータ
 * @returns JSON文字列
 */
const stringifyCanvas = (canvas: JsonCanvas): string => {
  const properties = [
    canvas.nodes === undefined ? undefined : formatArrayProperty("nodes", canvas.nodes),
    canvas.edges === undefined ? undefined : formatArrayProperty("edges", canvas.edges),
  ].filter((p) => p !== undefined);

  return properties.length === 0 ? "{}" : `{\n${properties.join(",\n")}\n}`;
};

/**
 * 指定されたパスの JSON-Canvas ファイルを読み込み、バリデーション済みのデータを返す。
 * @param fs - ファイルシステムサービス
 * @param filePath - 読み込み対象となる JSON-Canvas ファイルのパス
 * @returns バリデーション済みのキャンバスデータを得る Effect
 */
const readCanvas = (fs: FileSystem.FileSystem, filePath: string) =>
  Effect.gen(function* () {
    const exists = yield* fs.exists(filePath).pipe(
      Effect.mapError(
        (error) =>
          new CanvasError({
            message: `ファイル存在確認エラー: ${error.message}`,
            cause: error,
          }),
      ),
    );

    if (!exists) return { nodes: [], edges: [] };

    const data = yield* fs.readFileString(filePath).pipe(
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
  });

/**
 * キャンバスデータをカスタム JSON 形式で指定されたファイルパスに書き込む。
 * @param fs - ファイルシステムサービス
 * @param filePath - 書き込み対象となる JSON-Canvas ファイルのパス
 * @param canvas - 書き込むキャンバスデータ
 * @returns 書き込み処理を表す Effect
 */
const writeCanvas = (fs: FileSystem.FileSystem, filePath: string, canvas: JsonCanvas) =>
  Effect.gen(function* () {
    yield* fs.writeFileString(filePath, stringifyCanvas(canvas)).pipe(
      Effect.mapError(
        (error) =>
          new CanvasError({
            message: `ファイル書き込みエラー: ${error.message}`,
            cause: error,
          }),
      ),
    );
  });

/**
 * FileSystem を使ってキャンバスファイルの読み書きを行う、CanvasRepository の実装 Layer を生成する。
 * @param filePath - 読み書き対象となる JSON-Canvas ファイルのパス
 * @returns CanvasRepository の実装 Layer
 */
export const CanvasFileRepository = (filePath: string) =>
  Layer.effect(
    CanvasRepository,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;

      return {
        read: () => readCanvas(fs, filePath),
        write: (canvas) => writeCanvas(fs, filePath, canvas),
      };
    }),
  );
