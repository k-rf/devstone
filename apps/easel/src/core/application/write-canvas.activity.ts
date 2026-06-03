import { type JsonCanvas } from "@devstone/libs-json-canvas-spec";
import { Effect } from "effect";

import { CanvasRepository } from "../port/repository/canvas.repository.js";

/**
 * リポジトリへキャンバスデータを保存する Activity
 * @param canvas - 保存する対象のキャンバスデータ
 * @returns 処理の完了を示す Effect
 */
export const writeCanvasActivity = (canvas: JsonCanvas) =>
  Effect.gen(function* () {
    const repo = yield* CanvasRepository;
    yield* repo.write(canvas);
  });
