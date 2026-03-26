import { Context, Data, type Effect } from "effect";

import type { NotionTarget, TogglTarget } from "../domain/mapping.js";

export class MappingNotFoundError extends Data.TaggedError("MappingNotFoundError")<{
  readonly key: string;
}> {}

export class MappingStorePort extends Context.Tag("MappingStorePort")<
  MappingStorePort,
  {
    readonly getNotionToToggl: (
      category: string,
    ) => Effect.Effect<TogglTarget, MappingNotFoundError>;
    /**
     * Toggl Track の projectId（文字列化）を元に Notion ターゲットを返す。
     * KV のキーは `"toggl_to_notion"` で、値は `{ "12345": { pageTitle: "..." } }` 形式。
     */
    readonly getTogglToNotion: (
      projectId: string,
    ) => Effect.Effect<NotionTarget, MappingNotFoundError>;
  }
>() {}
