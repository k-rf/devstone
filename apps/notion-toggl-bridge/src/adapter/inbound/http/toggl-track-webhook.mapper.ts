import { Option } from "effect";

import { LinkActivityInput } from "../../../core/application/link-activity.input.js";

import type { TogglTrackWebhookPayload } from "./toggl-track-webhook.payload.js";

export const toLinkActivityInput = (
  payload: TogglTrackWebhookPayload,
): Option.Option<LinkActivityInput> => {
  const { project_id } = payload.payload;
  if (project_id === null) return Option.none();

  return Option.some(
    new LinkActivityInput({
      togglProjectId: String(project_id),
      eventId: payload.request_id,
    }),
  );
};
