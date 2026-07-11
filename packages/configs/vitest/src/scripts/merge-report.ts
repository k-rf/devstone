import { Command, Path } from "@effect/platform";
import { type Process } from "@effect/platform/CommandExecutor";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { Effect, Exit, Stream, String } from "effect";

const runString = <E, R>(stream: Stream.Stream<Uint8Array, E, R>): Effect.Effect<string, E, R> =>
  stream.pipe(Stream.decodeText(), Stream.runFold(String.empty, String.concat));

const runCommand = (command: Command.Command, scope: string) =>
  Command.start(command).pipe(
    Effect.andThen((process: Process) =>
      Effect.all([process.exitCode, runString(process.stdout), runString(process.stderr)], {
        concurrency: 3,
      }).pipe(
        Effect.flatMap(([exitCode, stdout, stderr]) =>
          exitCode === 0
            ? Effect.logInfo(`[${scope}]`, stdout).pipe(Effect.as(exitCode))
            : Effect.logError(`[${scope}]`, ...stderr.split("\n")).pipe(
                Effect.andThen(
                  Effect.fail(
                    new Error(`Process exited with code ${exitCode.toString()} in "${scope}"`),
                  ),
                ),
              ),
        ),
      ),
    ),
  );

const main = Effect.fn(function* () {
  const path = yield* Path.Path;
  const rootDir = path.resolve(import.meta.dirname, "../../../../../");

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

  yield* runCommand(merge, "merge");
  yield* runCommand(report, "report");
});

BunRuntime.runMain(
  Effect.scoped(Effect.suspend(main).pipe(Effect.provide(BunContext.layer))).pipe(
    Effect.catchAll((error) => Effect.fail(`[main] ${error.message}`)),
  ),
  {
    teardown: (exit, onExit) => {
      exit.pipe(
        Exit.match({
          onFailure: () => {
            onExit(2);
          },
          onSuccess: () => {
            onExit(0);
          },
        }),
      );
    },
  },
);
