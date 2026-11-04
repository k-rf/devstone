import { FileSystem } from "@effect/platform";
import { SystemError } from "@effect/platform/Error";
import { Effect } from "effect";
import { vol } from "memfs";

const runFs = <A>(
  method: keyof FileSystem.FileSystem,
  pathString: string,
  operation: () => A,
): Effect.Effect<A, SystemError> =>
  Effect.try({
    try: operation,
    catch: (error) =>
      new SystemError({
        reason: "Unknown",
        module: "FileSystem",
        method: method,
        pathOrDescriptor: pathString,
        cause: error,
      }),
  });

/**
 * テスト用のインメモリ FileSystem レイヤー（memfs ベース）。
 */
export const mockFileSystem = FileSystem.layerNoop({
  exists: (pathString) =>
    runFs("exists", pathString, () => {
      if (pathString.includes("__exists_error__")) throw new Error("simulated exists error");
      return vol.existsSync(pathString);
    }),
  readFileString: (pathString) =>
    runFs("readFileString", pathString, () => vol.readFileSync(pathString, "utf8") as string),
});
