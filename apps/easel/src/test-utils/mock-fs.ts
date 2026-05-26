import { FileSystem } from "@effect/platform";
import { SystemError } from "@effect/platform/Error";
import { type File } from "@effect/platform/FileSystem";
import { Size } from "@effect/platform/FileSystem";
import { Effect, Option } from "effect";
import { vol } from "memfs";

const runFs = <A>(
  method: keyof FileSystem.FileSystem,
  pathString: string,
  f: () => A,
): Effect.Effect<A, SystemError> =>
  Effect.try({
    try: f,
    catch: (error) =>
      new SystemError({
        reason: "Unknown",
        module: "FileSystem",
        method: method,
        pathOrDescriptor: pathString,
        cause: error,
      }),
  });

export const mockFileSystem = FileSystem.layerNoop({
  exists: (pathString) =>
    runFs("exists", pathString, () => {
      if (pathString.includes("\0")) throw new Error("null byte in path");
      return vol.existsSync(pathString);
    }),
  readFileString: (pathString) =>
    runFs("readFileString", pathString, () => vol.readFileSync(pathString, "utf8") as string),
  writeFileString: (pathString, data) =>
    runFs("writeFileString", pathString, () => {
      vol.writeFileSync(pathString, data);
    }),
  remove: (pathString) =>
    runFs("remove", pathString, () => {
      vol.rmSync(pathString, { recursive: true, force: true });
    }),
  stat: (pathString) =>
    runFs("stat", pathString, () => {
      const s = vol.statSync(pathString);
      const info: File.Info = {
        type: s.isDirectory() ? "Directory" : "File",
        size: Size(s.size),
        mtime: Option.fromNullable(s.mtime),
        atime: Option.fromNullable(s.atime),
        birthtime: Option.fromNullable(s.birthtime),
        dev: s.dev,
        ino: Option.fromNullable(s.ino),
        mode: s.mode,
        nlink: Option.fromNullable(s.nlink),
        uid: Option.fromNullable(s.uid),
        gid: Option.fromNullable(s.gid),
        rdev: Option.fromNullable(s.rdev),
        blocks: Option.none(),
        blksize: Option.none(),
      };
      return info;
    }),
});
