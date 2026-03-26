import { StartTimerInput } from "../../../core/application/start-timer.input.js";

import type { NotionWebhookPayload } from "./notion-webhook.payload.js";

export const toStartTimerInput = (payload: NotionWebhookPayload): StartTimerInput =>
  new StartTimerInput({
    relationPageId: payload.entity.id,
    eventId: payload.id,
  });
