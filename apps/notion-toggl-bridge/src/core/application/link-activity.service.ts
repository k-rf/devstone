import { Data, Effect } from "effect";

import { MappingStorePort } from "../port/mapping-store.port.js";
import { NotionApiPort } from "../port/notion-api.port.js";

import type { LinkActivityInput } from "./link-activity.input.js";
import type { LinkActivityOutput } from "./link-activity.output.js";

export class LinkActivityError extends Data.TaggedError("LinkActivityError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export const linkActivity = (
  input: LinkActivityInput,
  relationProperty: string,
): Effect.Effect<
  LinkActivityOutput,
  LinkActivityError,
  NotionApiPort | MappingStorePort
> =>
  Effect.gen(function* () {
    const notionApi = yield* NotionApiPort;
    const mappingStore = yield* MappingStorePort;

    const notionTarget = yield* mappingStore
      .getTogglToNotion(input.togglProjectId)
      .pipe(
        Effect.mapError(
          (error) =>
            new LinkActivityError({
              message: `Mapping not found for toggl project id: ${error.key}`,
              cause: error,
            }),
        ),
      );

    const dailyNote = yield* notionApi.getLatestDailyNote().pipe(
      Effect.mapError(
        (error) =>
          new LinkActivityError({
            message: `Failed to get latest daily note: ${error.message}`,
            cause: error,
          }),
      ),
    );

    yield* notionApi
      .addRelationToPage(dailyNote.id, relationProperty, notionTarget.pageId)
      .pipe(
        Effect.mapError(
          (error) =>
            new LinkActivityError({
              message: `Failed to add relation to page: ${error.message}`,
              cause: error,
            }),
        ),
      );

    return {
      dailyNotePageId: dailyNote.id,
      linkedPageTitle: notionTarget.pageId,
    };
  });
