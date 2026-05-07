import { FileSystem, Path } from "@effect/platform";
import { Effect, Option } from "effect";

/**
 * 指定されたプロジェクトパスからカバレッジファイルのパスを解決する
 */
export const resolveCoveragePath = (projectPath: string) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const fs = yield* FileSystem.FileSystem;
    const coverageFile = path.join(projectPath, "coverage", "coverage.json");

    return yield* fs.exists(coverageFile).pipe(
      Effect.map((exists) => (exists ? Option.some(coverageFile) : Option.none())),
      Effect.catchAll(() => Effect.succeed(Option.none())),
    );
  });
