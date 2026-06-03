import { Effect } from "effect";

import { CanvasRepository } from "../port/repository/canvas.repository.js";

/**
 * リポジトリからキャンバスデータを読み込む Activity
 * @returns キャンバスのデータを示す Effect
 */
export const readCanvasActivity = () =>
  Effect.gen(function* () {
    const repo = yield* CanvasRepository;
    return yield* repo.read();
  });
