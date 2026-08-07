import { type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Layer, Ref } from "effect";

import { CanvasRepository } from "../core/port/repository/canvas.repository.js";

/**
 * テスト用の CanvasRepository を Ref ベースで構築する。
 * @param canvasRef - キャンバス状態を保持する Ref
 * @returns CanvasRepository の Layer
 */
export const makeTestCanvasRepository = (canvasRef: Ref.Ref<JsonCanvas>) =>
  Layer.succeed(
    CanvasRepository,
    CanvasRepository.of({
      read: () => Ref.get(canvasRef),
      write: (canvas) => Ref.set(canvasRef, canvas),
    }),
  );

/**
 * 初期キャンバスからテスト用 Ref を生成する。
 * @param canvas - 初期キャンバス
 * @returns キャンバス状態を保持する Ref
 */
export const makeCanvasRef = (canvas: JsonCanvas): Ref.Ref<JsonCanvas> =>
  Effect.runSync(Ref.make(canvas));

/**
 * Ref から現在のキャンバスを同期的に取得する。
 * @param canvasRef - キャンバス状態を保持する Ref
 * @returns 現在のキャンバス
 */
export const getCanvas = (canvasRef: Ref.Ref<JsonCanvas>): JsonCanvas =>
  Effect.runSync(Ref.get(canvasRef));
