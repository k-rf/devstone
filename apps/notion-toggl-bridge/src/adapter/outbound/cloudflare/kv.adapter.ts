import { Effect, Layer } from "effect";

import { CacheError, CachePort } from "../../../core/port/outbound/cloudflare/cache.port";

/**
 * 最小限の KVNamespace インターフェース
 */
export interface KVNamespace {
  readonly get: (key: string) => Promise<string | null>;
  readonly put: (
    key: string,
    value: string,
    options?: { readonly expirationTtl?: number },
  ) => Promise<void>;
}

export const KvAdapterLive = (kvNamespace: KVNamespace) =>
  Layer.succeed(CachePort, {
    get: (key) =>
      Effect.tryPromise({
        try: () => kvNamespace.get(key).then((result) => result ?? undefined),
        catch: (e) =>
          new CacheError({
            message: `KV get error`,
            cause: e,
          }),
      }),
    put: (key, value, ttlSeconds) =>
      Effect.tryPromise({
        try: () =>
          kvNamespace.put(
            key,
            value,
            ttlSeconds === undefined ? {} : { expirationTtl: ttlSeconds },
          ),
        catch: (e) =>
          new CacheError({
            message: `KV put error`,
            cause: e,
          }),
      }),
  });
