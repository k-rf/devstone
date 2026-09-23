import { type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Ref } from "effect";

/**
 * 初期キャンバスからテスト用 Ref を生成する。
 * @param canvas - 初期キャンバス
 * @returns キャンバス状態を保持する Ref
 */
export const makeCanvasRef = (canvas: JsonCanvas): Ref.Ref<JsonCanvas> =>
  Effect.runSync(Ref.make(canvas));
