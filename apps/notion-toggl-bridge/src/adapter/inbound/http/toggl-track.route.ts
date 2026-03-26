import { Effect, Exit, Layer, Option, Schema } from "effect";
import { Hono } from "hono";

import { linkActivity } from "../../../core/application/link-activity.service.js";
import { EventStorePort } from "../../../core/port/event-store.port.js";
import { IdempotencyAdapterLive } from "../../outbound/kv/idempotency.adapter.js";
import { MappingAdapterLive } from "../../outbound/kv/mapping.adapter.js";
import { NotionApiAdapterLive } from "../../outbound/notion/notion-api.adapter.js";

import type { HonoEnvironment } from "./hono-environment.js";
import { togglTrackSignatureMiddleware } from "./middleware/toggl-track-signature.middleware.js";
import { toLinkActivityInput } from "./toggl-track-webhook.mapper.js";
import { TogglTrackWebhookPayload } from "./toggl-track-webhook.payload.js";

export const togglTrackRoute = new Hono<HonoEnvironment>();

togglTrackRoute.post("/", togglTrackSignatureMiddleware, async (c) => {
  const environment = c.env;
  const rawBody = c.get("rawBody");

  const payloadExit = await Schema.decodeUnknown(TogglTrackWebhookPayload)(
    JSON.parse(rawBody) as unknown,
  ).pipe(Effect.runPromiseExit);

  if (Exit.isFailure(payloadExit)) {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const payload = payloadExit.value;

  if (payload.metadata.action !== "inserted") {
    return c.json({ ok: true }, 200);
  }

  const inputOption = toLinkActivityInput(payload);
  if (Option.isNone(inputOption)) {
    return c.json({ ok: true }, 200);
  }

  const input = inputOption.value;
  const idempotencyKey = `toggl:${input.eventId}`;

  const layer = Layer.mergeAll(
    NotionApiAdapterLive(environment),
    IdempotencyAdapterLive(environment),
    MappingAdapterLive(environment),
  );

  const program = Effect.gen(function* () {
    const eventStore = yield* EventStorePort;
    const alreadyProcessed = yield* eventStore.isProcessed(idempotencyKey);
    if (!alreadyProcessed) {
      yield* eventStore.markAsProcessed(idempotencyKey, 86_400);
      yield* linkActivity(input, environment.NOTION_DAILY_NOTE_RELATION_PROPERTY);
    }
  }).pipe(Effect.provide(layer));

  const result = await Effect.runPromiseExit(program);

  return Exit.match(result, {
    onFailure: (cause) => {
      console.error("linkActivity failed:", cause);
      return c.json({ error: "Internal server error" }, 500);
    },
    onSuccess: () => c.json({ ok: true }, 200),
  });
});
