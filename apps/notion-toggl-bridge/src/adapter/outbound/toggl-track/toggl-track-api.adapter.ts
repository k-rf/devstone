import { Effect, Layer, Schema } from "effect";

import type { Environment } from "../../../core/port/environment.js";
import {
  TogglTrackApiError,
  type TogglTrackApiPort,
} from "../../../core/port/toggl-track-api.port.js";
import { TogglTrackApiPort as TogglTrackApiPortTag } from "../../../core/port/toggl-track-api.port.js";

import { toStartTimerOutput } from "./toggl-track-api.mapper.js";
import type { TogglStartTimerRequest } from "./toggl-track-api.request.js";
import {
  TogglMeResponseSchema,
  TogglTimeEntryResponseSchema,
} from "./toggl-track-api.response.js";

const TOGGL_API_BASE = "https://api.track.toggl.com/api/v9";

const togglFetch = <A, I>(
  url: string,
  method: string,
  apiToken: string,
  decoder: Schema.Schema<A, I>,
  body?: string,
): Effect.Effect<A, TogglTrackApiError> => {
  const credentials = btoa(`${apiToken}:api_token`);
  const headers: Record<string, string> = {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };

  return Effect.tryPromise({
    try: () => {
      const init: RequestInit = { method, headers };
      if (body !== undefined) {
        init.body = body;
      }
      return fetch(url, init).then((response) => response.json());
    },
    catch: (error) =>
      new TogglTrackApiError({ message: "Toggl Track API request failed", cause: error }),
  }).pipe(
    Effect.flatMap((raw) =>
      Schema.decodeUnknown(decoder)(raw).pipe(
        Effect.mapError(
          (error) =>
            new TogglTrackApiError({
              message: "Failed to decode Toggl Track API response",
              cause: error,
            }),
        ),
      ),
    ),
  );
};

export const TogglTrackApiAdapterLive = (
  environment: Environment,
): Layer.Layer<TogglTrackApiPort> =>
  Layer.succeed(TogglTrackApiPortTag, {
    startTimer: (input) =>
      Effect.sync(() => new Date().toISOString()).pipe(
        Effect.flatMap((startTime) => {
          const request: TogglStartTimerRequest = {
            description: input.description,
            workspace_id: Number(input.workspaceId),
            start: startTime,
            duration: -1,
            created_with: "notion-toggl-bridge",
          };

          return togglFetch(
            `${TOGGL_API_BASE}/workspaces/${input.workspaceId}/time_entries`,
            "POST",
            environment.TOGGL_TRACK_API_TOKEN,
            TogglTimeEntryResponseSchema,
            JSON.stringify(request),
          );
        }),
        Effect.map(toStartTimerOutput),
      ),

    stopCurrentTimer: () =>
      togglFetch(
        `${TOGGL_API_BASE}/me`,
        "GET",
        environment.TOGGL_TRACK_API_TOKEN,
        TogglMeResponseSchema,
      ).pipe(
        Effect.flatMap((me) =>
          togglFetch(
            `${TOGGL_API_BASE}/workspaces/${String(me.default_workspace_id)}/time_entries/current`,
            "GET",
            environment.TOGGL_TRACK_API_TOKEN,
            Schema.NullOr(TogglTimeEntryResponseSchema),
          ).pipe(
            Effect.flatMap((current) => {
              if (current === null) return Effect.void;
              return togglFetch(
                `${TOGGL_API_BASE}/workspaces/${String(current.workspace_id)}/time_entries/${String(current.id)}/stop`,
                "PATCH",
                environment.TOGGL_TRACK_API_TOKEN,
                TogglTimeEntryResponseSchema,
              ).pipe(Effect.asVoid);
            }),
          ),
        ),
      ),
  });
