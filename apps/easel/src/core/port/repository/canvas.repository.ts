import { type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Context, type Effect } from "effect";

import { type CanvasError } from "../../domain/errors.js";

/**
 * キャンバスデータを永続化（読み込み・書き込み）するためのリポジトリの抽象（Port）。
 */
export class CanvasRepository extends Context.Tag("CanvasRepository")<
  CanvasRepository,
  {
    readonly read: () => Effect.Effect<JsonCanvas, CanvasError>;
    readonly write: (canvas: JsonCanvas) => Effect.Effect<void, CanvasError>;
  }
>() {}
