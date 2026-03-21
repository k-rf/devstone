import { Effect, Layer, Option, Schema } from "effect";

import { NotionTarget, TogglTarget } from "../../../core/domain/mapping.js";
import type { Environment } from "../../../core/port/environment.js";
import {
  MappingNotFoundError,
  MappingStorePort,
} from "../../../core/port/mapping-store.port.js";

const NotionToTogglTable = Schema.Record({
  key: Schema.String,
  value: TogglTarget,
});

const TogglToNotionTable = Schema.Record({
  key: Schema.String,
  value: NotionTarget,
});

const getTable = <T, I>(
  kv: KVNamespace,
  tableKey: string,
  decoder: Schema.Schema<T, I>,
): Effect.Effect<T, MappingNotFoundError> =>
  Effect.tryPromise({
    try: () => kv.get(tableKey, "json"),
    catch: (error: unknown) => error,
  }).pipe(
    Effect.option,
    Effect.flatMap((option) => {
      if (Option.isNone(option) || option.value === null) {
        return Effect.fail(new MappingNotFoundError({ key: tableKey }));
      }
      return Schema.decodeUnknown(decoder)(option.value).pipe(
        Effect.mapError(() => new MappingNotFoundError({ key: tableKey })),
      );
    }),
  );

export const MappingAdapterLive = (environment: Environment): Layer.Layer<MappingStorePort> =>
  Layer.succeed(MappingStorePort, {
    getNotionToToggl: (category) =>
      getTable(environment.MAPPING_KV, "notion_to_toggl", NotionToTogglTable).pipe(
        Effect.flatMap((table) => {
          const target = table[category];
          return target === undefined
            ? Effect.fail(new MappingNotFoundError({ key: category }))
            : Effect.succeed(target);
        }),
      ),

    getTogglToNotion: (projectId) =>
      getTable(environment.MAPPING_KV, "toggl_to_notion", TogglToNotionTable).pipe(
        Effect.flatMap((table) => {
          const target = table[projectId];
          return target === undefined
            ? Effect.fail(new MappingNotFoundError({ key: projectId }))
            : Effect.succeed(target);
        }),
      ),
  });
