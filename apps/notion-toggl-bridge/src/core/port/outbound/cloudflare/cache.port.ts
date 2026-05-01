import { Context, Data, type Effect } from "effect";

/**
 * キャッシュ関連のエラー
 */
export class CacheError extends Data.TaggedError("CacheError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class CachePort extends Context.Tag("CachePort")<
  CachePort,
  {
    readonly get: (key: string) => Effect.Effect<string | undefined, CacheError>;
    readonly put: (
      key: string,
      value: string,
      ttlSeconds?: number,
    ) => Effect.Effect<void, CacheError>;
  }
>() {}
