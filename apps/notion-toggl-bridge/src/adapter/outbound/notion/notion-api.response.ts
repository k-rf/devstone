import { Schema } from "effect";

export class NotionPagePropertyTitle extends Schema.Class<NotionPagePropertyTitle>(
  "NotionPagePropertyTitle",
)({
  type: Schema.Literal("title"),
  title: Schema.Array(
    Schema.Struct({
      plain_text: Schema.String,
    }),
  ),
}) {}

export class NotionPagePropertySelect extends Schema.Class<NotionPagePropertySelect>(
  "NotionPagePropertySelect",
)({
  type: Schema.Literal("select"),
  select: Schema.NullOr(
    Schema.Struct({
      name: Schema.String,
    }),
  ),
}) {}

export class NotionPageResponse extends Schema.Class<NotionPageResponse>("NotionPageResponse")({
  id: Schema.String,
  properties: Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }),
}) {}

export class NotionDatabaseQueryResponse extends Schema.Class<NotionDatabaseQueryResponse>(
  "NotionDatabaseQueryResponse",
)({
  results: Schema.Array(NotionPageResponse),
}) {}
