import { Schema } from "effect";

/**
 * Notion Webhook Payload
 * デザインドックのサンプルに基づき定義
 */
export const NotionWebhookPayload = Schema.Struct({
  source: Schema.Struct({
    user_id: Schema.String,
  }),
  data: Schema.Struct({
    id: Schema.String,
    properties: Schema.Struct({
      "☑️ やること": Schema.Struct({
        type: Schema.Literal("relation"),
        relation: Schema.Tuple(
          Schema.Struct({
            id: Schema.String,
          }),
        ),
      }),
    }),
  }),
});

export type NotionWebhookPayload = Schema.Schema.Type<typeof NotionWebhookPayload>;
