import type { StartTimerOutput } from "../../../core/application/start-timer.output.js";

import type { TogglTimeEntryResponse } from "./toggl-track-api.response.js";

export const toStartTimerOutput = (response: TogglTimeEntryResponse): StartTimerOutput => ({
  timerId: response.id,
  description: response.description,
  startedAt: response.start,
});
