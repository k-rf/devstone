import { Context, type Effect } from "effect";

export class EventStorePort extends Context.Tag("EventStorePort")<
  EventStorePort,
  {
    readonly isProcessed: (key: string) => Effect.Effect<boolean>;
    readonly markAsProcessed: (key: string, ttlSeconds: number) => Effect.Effect<void>;
  }
>() {}
