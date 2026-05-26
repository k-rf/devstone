import { Effect } from "effect";

import { CanvasRepository } from "../port/repository/canvas.repository.js";

/**
 * リポジトリからキャンバスデータを読み込む Step
 * @returns キャンバスのデータを示す Effect
 */
export const readCanvasStep = () =>
  Effect.gen(function* () {
    const repo = yield* CanvasRepository;
    return yield* repo.read();
  });
