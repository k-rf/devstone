import { FileSystem, Path } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Array, Config, Effect, Option } from "effect";

import { findSubProjects } from "../utils/find-sub-projects.js";
import { getProjectIdentifier } from "../utils/get-project-identifier.js";
import { resolveCoveragePath } from "../utils/resolve-coverage-path.js";

const main = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const rootDir = yield* Config.string("PROJECT_ROOT");
  const rawDir = path.join(rootDir, "coverage", "raw");

  // 出力先準備
  yield* fs.exists(rawDir).pipe(
    Effect.flatMap((exists) => (exists ? fs.remove(rawDir, { recursive: true }) : Effect.void)),
    Effect.flatMap(() => fs.makeDirectory(rawDir, { recursive: true })),
  );

  // 探索対象（apps/*, packages/*/*）
  const apps = yield* findSubProjects(path.join(rootDir, "apps"));
  const packageGroups = yield* findSubProjects(path.join(rootDir, "packages"));

  const packages = yield* Effect.forEach(packageGroups, (group) => findSubProjects(group), {
    concurrency: "unbounded",
  }).pipe(Effect.map(Array.flatten));

  const allProjects = [...apps, ...packages];

  // カバレッジ収集の実行
  yield* Effect.forEach(
    allProjects,
    (projectPath) =>
      resolveCoveragePath(projectPath).pipe(
        Effect.flatMap((maybeFile) =>
          Option.match(maybeFile, {
            onSome: (file) => {
              const id = getProjectIdentifier(projectPath, rootDir);
              const destination = path.join(rawDir, `${id}.json`);
              return fs
                .copyFile(file, destination)
                .pipe(Effect.andThen(Effect.logInfo(`Collected: ${id}`)));
            },
            onNone: () => Effect.void,
          }),
        ),
        Effect.catchAll((error) =>
          Effect.logError(`Failed to collect coverage from ${projectPath}`).pipe(
            Effect.annotateLogs("error", String(error)),
          ),
        ),
      ),
    { concurrency: "unbounded" },
  );

  yield* Effect.logInfo("Successfully finished coverage collection.");
});

Effect.suspend(() => main).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain);
