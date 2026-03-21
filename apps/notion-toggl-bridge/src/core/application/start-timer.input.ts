import { Schema } from "effect";

export class StartTimerInput extends Schema.Class<StartTimerInput>("StartTimerInput")({
  relationPageId: Schema.String,
  eventId: Schema.String,
}) {}
