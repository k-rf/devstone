import { Data, Effect } from "effect";

import { MappingStorePort } from "../port/mapping-store.port.js";
import { NotionApiPort } from "../port/notion-api.port.js";
import { TogglTrackApiPort } from "../port/toggl-track-api.port.js";

import type { StartTimerInput } from "./start-timer.input.js";
import type { StartTimerOutput } from "./start-timer.output.js";

export class StartTimerError extends Data.TaggedError("StartTimerError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export const startTimer = (
  input: StartTimerInput,
  workspaceId: string,
): Effect.Effect<
  StartTimerOutput,
  StartTimerError,
  NotionApiPort | TogglTrackApiPort | MappingStorePort
> =>
  Effect.gen(function* () {
    const notionApi = yield* NotionApiPort;
    const togglTrackApi = yield* TogglTrackApiPort;
    const mappingStore = yield* MappingStorePort;

    const page = yield* notionApi.getRelationPage(input.relationPageId).pipe(
      Effect.mapError(
        (error) => new StartTimerError({ message: `Failed to get relation page: ${error.message}`, cause: error }),
      ),
    );

    const mapping = yield* mappingStore.getNotionToToggl(page.category).pipe(
      Effect.mapError(
        (error) =>
          new StartTimerError({
            message: `Mapping not found for category: ${error.key}`,
            cause: error,
          }),
      ),
    );

    yield* togglTrackApi.stopCurrentTimer().pipe(
      Effect.mapError(
        (error) =>
          new StartTimerError({ message: `Failed to stop current timer: ${error.message}`, cause: error }),
      ),
    );

    return yield* togglTrackApi
      .startTimer({
        description: page.name,
        client: mapping.client,
        project: mapping.project,
        workspaceId,
      })
      .pipe(
        Effect.mapError(
          (error) => new StartTimerError({ message: `Failed to start timer: ${error.message}`, cause: error }),
        ),
      );
  });
