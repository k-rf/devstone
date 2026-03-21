import { Context, Data, type Effect } from "effect";

import type { StartTimerOutput } from "../application/start-timer.output.js";

export class TogglTrackApiError extends Data.TaggedError("TogglTrackApiError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export interface StartTimerPortInput {
  readonly description: string;
  readonly client: string;
  readonly project: string;
  readonly workspaceId: string;
}

export class TogglTrackApiPort extends Context.Tag("TogglTrackApiPort")<
  TogglTrackApiPort,
  {
    readonly startTimer: (
      input: StartTimerPortInput,
    ) => Effect.Effect<StartTimerOutput, TogglTrackApiError>;
    readonly stopCurrentTimer: () => Effect.Effect<void, TogglTrackApiError>;
  }
>() {}
