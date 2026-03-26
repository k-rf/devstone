import { Schema } from "effect";

export class NotionWebhookPayload extends Schema.Class<NotionWebhookPayload>(
  "NotionWebhookPayload",
)({
  id: Schema.String,
  type: Schema.String,
  entity: Schema.Struct({
    id: Schema.String,
    type: Schema.String,
  }),
  timestamp: Schema.String,
  data: Schema.optionalWith(
    Schema.Struct({
      parent: Schema.optionalWith(
        Schema.Struct({
          id: Schema.String,
          type: Schema.String,
        }),
        { exact: true },
      ),
    }),
    { exact: true },
  ),
}) {}
