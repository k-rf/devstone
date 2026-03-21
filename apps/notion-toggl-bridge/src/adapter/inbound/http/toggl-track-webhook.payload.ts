import { Schema } from "effect";

export class TogglTrackWebhookPayload extends Schema.Class<TogglTrackWebhookPayload>(
  "TogglTrackWebhookPayload",
)({
  request_id: Schema.String,
  created_at: Schema.String,
  event_id: Schema.Number,
  subscription_id: Schema.Number,
  metadata: Schema.Struct({
    action: Schema.String,
    event_user_id: Schema.Number,
    model: Schema.String,
    project_id: Schema.optionalWith(Schema.Number, { exact: true }),
    path: Schema.String,
  }),
  payload: Schema.Struct({
    id: Schema.Number,
    description: Schema.optionalWith(Schema.String, { exact: true }),
    workspace_id: Schema.Number,
    project_id: Schema.NullOr(Schema.Number),
    start: Schema.String,
    duration: Schema.Number,
  }),
}) {}
