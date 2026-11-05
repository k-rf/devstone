import { Schema } from "effect";

export const NotionTitleProperty = Schema.Struct({
  title: Schema.Array(Schema.Unknown),
});
