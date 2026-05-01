import { Schema } from "effect";

export const NotionTitleProperty = Schema.Struct({
  title: Schema.Array(Schema.Unknown),
});

export const NotionSelectProperty = Schema.Struct({
  select: Schema.Struct({ name: Schema.String }),
});

export const NotionMultiSelectProperty = Schema.Struct({
  multi_select: Schema.Array(Schema.Struct({ name: Schema.String })),
});

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
