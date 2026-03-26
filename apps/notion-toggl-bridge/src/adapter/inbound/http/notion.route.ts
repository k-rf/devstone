import { Effect, Exit, Layer, Schema } from "effect";
import { Hono } from "hono";

import { startTimer } from "../../../core/application/start-timer.service.js";
import { EventStorePort } from "../../../core/port/event-store.port.js";
import { IdempotencyAdapterLive } from "../../outbound/kv/idempotency.adapter.js";
import { MappingAdapterLive } from "../../outbound/kv/mapping.adapter.js";
import { NotionApiAdapterLive } from "../../outbound/notion/notion-api.adapter.js";
import { TogglTrackApiAdapterLive } from "../../outbound/toggl-track/toggl-track-api.adapter.js";

import type { HonoEnvironment } from "./hono-environment.js";
import { notionSignatureMiddleware } from "./middleware/notion-signature.middleware.js";
import { toStartTimerInput } from "./notion-webhook.mapper.js";
import { NotionWebhookPayload } from "./notion-webhook.payload.js";

export const notionRoute = new Hono<HonoEnvironment>();

notionRoute.post("/", notionSignatureMiddleware, async (c) => {
  const environment = c.env;
  const rawBody = c.get("rawBody");

  const payloadExit = await Schema.decodeUnknown(NotionWebhookPayload)(
    JSON.parse(rawBody) as unknown,
  ).pipe(Effect.runPromiseExit);

  if (Exit.isFailure(payloadExit)) {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const input = toStartTimerInput(payloadExit.value);
  const idempotencyKey = `notion:${input.eventId}`;

  const layer = Layer.mergeAll(
    NotionApiAdapterLive(environment),
    TogglTrackApiAdapterLive(environment),
    IdempotencyAdapterLive(environment),
    MappingAdapterLive(environment),
  );

  const program = Effect.gen(function* () {
    const eventStore = yield* EventStorePort;
    const alreadyProcessed = yield* eventStore.isProcessed(idempotencyKey);
    if (!alreadyProcessed) {
      yield* eventStore.markAsProcessed(idempotencyKey, 86_400);
      yield* startTimer(input, environment.TOGGL_TRACK_WORKSPACE_ID);
    }
  }).pipe(Effect.provide(layer));

  const result = await Effect.runPromiseExit(program);

  return Exit.match(result, {
    onFailure: (cause) => {
      console.error("startTimer failed:", cause);
      return c.json({ error: "Internal server error" }, 500);
    },
    onSuccess: () => c.json({ ok: true }, 200),
  });
});
