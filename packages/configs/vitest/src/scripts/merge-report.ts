import { Command, Path } from "@effect/platform";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Config, Effect } from "effect";

const main = Effect.fn(function* () {
  const rootDir = yield* Config.string("PROJECT_ROOT");

  const path = yield* Path.Path;
  const coverageDir = path.join(rootDir, "coverage");

  const merge = Command.make(
    "nyc",
    "merge",
    path.join(coverageDir, "raw"),
    path.join(coverageDir, "merged.json"),
  );

  const report = Command.make(
    "nyc",
    "report",
    "-t",
    coverageDir,
    "--report-dir",
    path.join(coverageDir, "report"),
    "--reporter=html",
    "--exclude-after-remap=false",
  );

  yield* Command.string(merge).pipe(
    Effect.tap((output) => Effect.logInfo(output)),
    Effect.andThen(Command.string(report)),
    Effect.tap((output) => Effect.logInfo(output)),
  );
});

Effect.suspend(main).pipe(Effect.provide(BunContext.layer), BunRuntime.runMain);
