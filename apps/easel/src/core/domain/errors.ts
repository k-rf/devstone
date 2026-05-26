import { Data } from "effect";

/**
 * キャンバス操作に関するエラー。
 * エラーメッセージとオプションの原因（cause）を保持します。
 */
export class CanvasError extends Data.TaggedError("CanvasError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}
