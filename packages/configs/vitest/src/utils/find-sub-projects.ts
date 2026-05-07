import { FileSystem, Path } from "@effect/platform";
import { Array, Effect, Option } from "effect";

/**
 * 特定のディレクトリ配下のサブディレクトリを探索する
 */
export const findSubProjects = (baseDir: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const targetDir = path.resolve(baseDir);

    const entries = yield* fs
      .readDirectory(targetDir)
      .pipe(Effect.catchAll(() => Effect.succeed([] as readonly string[])));

    const results = yield* Effect.forEach(
      entries,
      (entry) => {
        const fullPath = path.join(targetDir, entry);
        return fs.stat(fullPath).pipe(
          Effect.map((stats) =>
            stats.type === "Directory" ? Option.some(fullPath) : Option.none(),
          ),
          Effect.catchAll(() => Effect.succeed(Option.none())),
        );
      },
      { concurrency: "unbounded" },
    );

    return Array.filterMap(results, (p) => p);
  });
