#!/usr/bin/env bun

import { $ } from "bun";
import { Data, Effect, Schema } from "effect";

import { promiseChain } from "../src/utils/promise-chain";

class FileNotFound extends Data.TaggedError("FileNotFound")<{ message: string }> {}
class FileReadError extends Data.TaggedError("FileReadError")<{ message: string }> {}
class WranglerError extends Data.TaggedError("WranglerError")<{ message: string }> {}

const ConfigSchema = Schema.Struct({
  namespaceId: Schema.String,
  mapper: Schema.Record({ key: Schema.String, value: Schema.String }),
});

const loadConfig = () => {
  const mapperFile = Bun.file(import.meta.dir + "/mapper.json");

  return Effect.promise(() => mapperFile.exists()).pipe(
    Effect.filterOrFail(
      (isExisting) => isExisting,
      () => new FileNotFound({ message: "mapper.json が見つかりません。" }),
    ),
    Effect.flatMap(() =>
      Effect.tryPromise({
        try: () => mapperFile.json() as Promise<unknown>,
        catch: (error) =>
          new FileReadError({ message: `mapper.json の読み込みに失敗しました: ${String(error)}` }),
      }),
    ),
    Effect.flatMap((json) =>
      Schema.decodeUnknown(ConfigSchema)(json).pipe(
        Effect.mapError((error) => new Error(`バリデーションに失敗しました: ${String(error)}`)),
      ),
    ),
  );
};

const syncToKV = (namespaceId: string, mapper: Record<string, string>) => {
  const tasks = Object.entries(mapper).map(([key, value]) => async () => {
    await $`pnpm wrangler kv key put ${key} ${value} --namespace-id ${namespaceId} --remote`;
    await Bun.sleep(300);
  });

  return Effect.tryPromise({
    try: () => promiseChain(tasks)(),
    catch: (error) =>
      new WranglerError({ message: `同期中にエラーが発生しました: ${String(error)}` }),
  });
};

const main = loadConfig().pipe(
  Effect.flatMap(({ namespaceId, mapper }) => syncToKV(namespaceId, mapper)),
  Effect.catchAll((error) =>
    Effect.logError(error.message).pipe(Effect.andThen(Effect.sync(() => process.exit(1)))),
  ),
);

await Effect.runPromise(main);
