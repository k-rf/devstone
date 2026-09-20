import { type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect, Ref } from "effect";

/**
 * Ref から現在のキャンバスを同期的に取得する。
 * @param canvasRef - キャンバス状態を保持する Ref
 * @returns 現在のキャンバス
 */
export const getCanvas = (canvasRef: Ref.Ref<JsonCanvas>): JsonCanvas =>
  Effect.runSync(Ref.get(canvasRef));
