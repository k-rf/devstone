import { Effect, Layer, Option } from "effect";

import type { Environment } from "../../../core/port/environment.js";
import { EventStorePort } from "../../../core/port/event-store.port.js";

export const IdempotencyAdapterLive = (environment: Environment): Layer.Layer<EventStorePort> =>
  Layer.succeed(EventStorePort, {
    isProcessed: (key) =>
      Effect.tryPromise({
        try: () => environment.IDEMPOTENCY_KV.get(key),
        catch: (error: unknown) => error,
      }).pipe(
        Effect.option,
        Effect.map((option) => Option.isSome(option) && option.value !== null),
      ),

    markAsProcessed: (key, ttlSeconds) =>
      Effect.tryPromise({
        try: () =>
          environment.IDEMPOTENCY_KV.put(key, "1", {
            expirationTtl: ttlSeconds,
          }),
        catch: (error: unknown) => error,
      }).pipe(
        Effect.orDie,
        Effect.asVoid,
      ),
  });
