import { Schema } from "effect";

/**
 * Notion API のレスポンスペイロード
 */
export const NotionPagePayload = Schema.Struct({
  parent: Schema.Struct({
    type: Schema.Literal("database_id"),
    database_id: Schema.String,
  }),
  properties: Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }),
});

export type NotionPagePayload = Schema.Schema.Type<typeof NotionPagePayload>;
